import { NextResponse } from 'next/server';
import fs from 'node:fs';
import os from 'node:os';
import { execSync } from 'node:child_process';
import { unstable_noStore as noStore } from 'next/cache';
import { readFileSync } from 'fs';
import prisma from '../../prisma';

export async function GET() {
  noStore();
  try {
    // 1. Sistemos resursai (CPU, RAM, Diskas)
    const loadAvg = os.loadavg();
    const load = `${loadAvg[0].toFixed(2)}, ${loadAvg[1].toFixed(2)}, ${loadAvg[2].toFixed(2)}`;

    let memTotal = '0G',
      memUsed = '0G',
      memFree = '0G';
    try {
      const memInfo = fs.readFileSync('/host/proc/meminfo', 'utf8');
      const totalMatch = memInfo.match(/MemTotal:\s+(\d+)/);
      const availableMatch = memInfo.match(/MemAvailable:\s+(\d+)/);
      if (totalMatch && availableMatch) {
        const totalKb = parseInt(totalMatch[1]);
        const availableKb = parseInt(availableMatch[1]);
        const usedKb = totalKb - availableKb;
        memTotal = (totalKb / 1048576).toFixed(1) + 'G';
        memUsed = (usedKb / 1048576).toFixed(1) + 'G';
        memFree = (availableKb / 1048576).toFixed(1) + 'G';
      }
    } catch (e) {
      /* ignore */
    }

    let uptimeDays = 0;
    try {
      const uptimeInfo = fs.readFileSync('/host/proc/uptime', 'utf8');
      uptimeDays = Math.floor(parseFloat(uptimeInfo.split(' ')[0]) / 86400);
    } catch (e) {
      /* ignore */
    }

    let diskUsage = '0%';
    try {
      const dfOutput = execSync('df -h / | tail -1').toString().trim();
      diskUsage = dfOutput.split(/\s+/)[4];
    } catch (e) {
      /* ignore */
    }

    // 2. Svetainių HTTP patikrinimas
    const checkUrl = async (url: string) => {
      try {
        const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
        return res.status; // Grąžina 200, 302, 403 ir t.t.
      } catch (e) {
        return 0; // Klaida
      }
    };

    const portfolioStatus = await checkUrl('https://morkunas.info');
    const knowledgeStatus = await checkUrl('https://knowledge.morkunas.info');

    // 3. Konteinerių sąrašas
    let containers: any[] = [];
    try {
      const dockerRes = await fetch('http://socket-proxy:2375/containers/json?all=true', {
        cache: 'no-store',
      });
      if (dockerRes.ok) {
        const data = await dockerRes.json();
        containers = data.map((c: any) => ({
          name: c.Names[0].replace('/', ''),
          state: c.State,
        }));
      }
    } catch (e) {
      /* ignore */
    }

    // 4. Nuskaitome aliarmų istoriją
    let alerts: any[] = [];
    let selfHealingCount = 0;
    try {
      const alertsFile = readFileSync('/host/tmp/alerts_history.log', 'utf8');
      alerts = alertsFile
        .trim()
        .split('\n')
        .map((line) => JSON.parse(line))
        .reverse();

      selfHealingCount = alerts.filter(
        (a: any) =>
          a.message.includes('sėkmingai restartuotas') || a.message.includes('sėkmingai paleistas')
      ).length;
    } catch (e) {
      console.error('Nepavyko perskaityti alerts_history.log:', e);
    }

    // 5. Skaičiuojame Uptime procentą
    let portfolioUptime = 100;
    let knowledgeUptime = 100;

    try {
      const uptimeFile = readFileSync('/host/tmp/uptime_history.log', 'utf8');
      const lines = uptimeFile.trim().split('\n').filter(Boolean);

      let pfTotal = 0,
        pfUp = 0;
      let kbTotal = 0,
        kbUp = 0;

      lines.forEach((line) => {
        const parts = line.split(' ');
        if (parts.length === 2) {
          // Portfolio formatas: timestamp status
          pfTotal++;
          if (parts[1] === '1') pfUp++;
        } else if (parts.length === 3 && parts[0] === 'kb') {
          // KB formatas: kb timestamp status
          kbTotal++;
          if (parts[2] === '1') kbUp++;
        }
      });

      if (pfTotal > 0) portfolioUptime = Math.round((pfUp / pfTotal) * 100);
      if (kbTotal > 0) knowledgeUptime = Math.round((kbUp / kbTotal) * 100);
    } catch (e) {
      // Jei failo nėra, paliekame 100%
    }

    // 6. Renkame atsako laikus grafikui
    let responseTimes: any[] = [];
    try {
      const uptimeFile = readFileSync('/host/tmp/uptime_history.log', 'utf8');
      const lines = uptimeFile.trim().split('\n').filter(Boolean).slice(-20); // Paskutiniai 20 įrašų

      let index = 1;
      const groupedData: Record<number, { name: string; Knowledge?: number; Portfolio?: number }> =
        {};
      let currentGroup = 1;

      // Einame per visas eilutes ir bandome jas suporuoti
      lines.forEach((line) => {
        const parts = line.split(' ');

        // Knowledge Base formatas
        if (parts.length === 4 && parts[0] === 'kb') {
          groupedData[currentGroup] = {
            name: `#${currentGroup}`,
            Knowledge: parseFloat(parts[3]),
          };
          currentGroup++; // Pereiname prie kito taško
        }
        // Portfolio formatas
        else if (parts.length === 3) {
          // Jei prieš tai buvęs taškas neturi Portfolio, pridedame jį ten pat
          const prevGroup = currentGroup - 1;
          if (groupedData[prevGroup] && !groupedData[prevGroup].Portfolio) {
            groupedData[prevGroup].Portfolio = parseFloat(parts[2]);
          } else {
            // Kitu atveju kuriame naują tašką
            groupedData[currentGroup] = {
              name: `#${currentGroup}`,
              Portfolio: parseFloat(parts[2]),
            };
            currentGroup++;
          }
        }
      });

      // Paverčiame objektą į masyvą ir paimame paskutinius 15 taškų, kad grafikas būtų švaresnis
      responseTimes = Object.values(groupedData).slice(-15);
    } catch (e) {
      console.error('Klaida skaitant uptime:', e);
    }

    // 7. Grupuojame aliarmus pagal savaitės dieną ir valandą
    const heatmapData: any[] = [];
    const days = [
      'Sekmadienis',
      'Pirmadienis',
      'Antradienis',
      'Trečiadienis',
      'Ketvirtadienis',
      'Penktadienis',
      'Šeštadienis',
    ];

    // Sukuriame tuščią tinklelį
    for (let h = 0; h < 24; h++) {
      const row: any = { hour: `${h.toString().padStart(2, '0')}:00` };
      days.forEach((day) => (row[day] = 0));
      heatmapData.push(row);
    }

    // Užpildome duomenis
    alerts.forEach((alert: any) => {
      try {
        const date = new Date(alert.time);
        const dayName = days[date.getDay()];
        const hour = date.getHours();

        if (heatmapData[hour]) {
          heatmapData[hour][dayName]++;
        }
      } catch (e) {
        /* ignore */
      }
    });

    // 8. Nuskaitome ping istoriją IR statistiką
    let pingHistory: any[] = [];
    const serverStats: Record<string, { avg: number; min: number; max: number }> = {};

    try {
      // Ištraukiame unikalius serverių pavadinimus
      const uniqueTargets = await prisma.pingLog.findMany({
        select: { target: true },
        distinct: ['target'],
      });

      let allRecentPings: any[] = [];

      // Kiekvienam serveriui imame po paskutinius 15 įrašų
      for (const t of uniqueTargets) {
        const recent = await prisma.pingLog.findMany({
          where: { target: t.target },
          orderBy: { createdAt: 'desc' },
          take: 15, // Imame 15 naujausių kiekvienam
        });
        allRecentPings = [...allRecentPings, ...recent];
      }

      // Surikiuojame visus pagal laiką (nuo seniausio iki naujausio) grafikui
      allRecentPings.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      // --- STATISTIKOS SKAIČIAVIMAS (Dabar tikslesnis) ---
      allRecentPings.forEach((p) => {
        if (!serverStats[p.target]) {
          serverStats[p.target] = { avg: 0, min: p.latency, max: p.latency };
        }
        const s = serverStats[p.target];
        s.avg += p.latency;
        s.min = Math.min(s.min, p.latency);
        s.max = Math.max(s.max, p.latency);
      });

      Object.keys(serverStats).forEach((target) => {
        // Suskaičiuojame kiek įrašų turime šiam serveriui
        const count = allRecentPings.filter((p) => p.target === target).length;
        serverStats[target].avg = parseFloat((serverStats[target].avg / count).toFixed(1));
        serverStats[target].min = parseFloat(serverStats[target].min.toFixed(1));
        serverStats[target].max = parseFloat(serverStats[target].max.toFixed(1));
      });
      // ---------------------------------------------------

      // Grupuojame laiko grafikui
      const grouped: Record<number, any> = {};

      allRecentPings.forEach((p) => {
        // Naudojame timestamp kaip raktą (unikalu visam laikui)
        const timeKey = p.createdAt.getTime();

        if (!grouped[timeKey]) {
          grouped[timeKey] = { timestamp: timeKey };
        }
        grouped[timeKey][p.target] = p.latency;
      });

      pingHistory = Object.values(grouped).sort((a, b) => a.timestamp - b.timestamp);
    } catch (e) {
      console.error('Ping stats error:', e);
    }

    // 8.1. Nuskaitome ping istoriją SAVAITĖS grafikui (sugrupuota pagal dieną)
    let weeklyPingHistory: any[] = [];
    try {
      const weeklyPings = await prisma.pingLog.findMany({
        orderBy: { createdAt: 'asc' },
        take: 1000, // Imame daugiau duomenų
      });

      const weeklyGrouped: Record<string, any> = {};

      weeklyPings.forEach((p) => {
        // Suformatuojame datą kaip MMMM-DD (pvz., 10-30)
        const dateKey = p.createdAt.toLocaleDateString('lt-LT', {
          month: '2-digit',
          day: '2-digit',
          timeZone: 'Europe/Vilnius',
        });

        if (!weeklyGrouped[dateKey]) {
          weeklyGrouped[dateKey] = { name: dateKey, counts: {} };
        }

        const g = weeklyGrouped[dateKey];
        if (!g.counts[p.target]) {
          g.counts[p.target] = { sum: 0, count: 0 };
        }
        g.counts[p.target].sum += p.latency;
        g.counts[p.target].count += 1;
      });

      // Paverčiame sumas į vidurkius
      weeklyPingHistory = Object.values(weeklyGrouped)
        .map((dayData: any) => {
          const result: any = { name: dayData.name };
          Object.keys(dayData.counts).forEach((target) => {
            result[target] = parseFloat(
              (dayData.counts[target].sum / dayData.counts[target].count).toFixed(1)
            );
          });
          return result;
        })
        .slice(-7); // Paimame tik paskutines 7 dienas
    } catch (e) {
      console.error('Klaida skaičiuojant savaitės pingus:', e);
    }

    return NextResponse.json({
      success: true,
      data: {
        system: {
          load,
          memory: { total: memTotal, used: memUsed, free: memFree },
          uptimeDays,
          diskUsage,
        },
        websites: [
          { name: 'Portfolio (morkunas.info)', status: portfolioStatus },
          { name: 'Knowledge Base (knowledge.morkunas.info)', status: knowledgeStatus },
        ],
        containers: containers.filter((c: any) =>
          [
            'resume_website',
            'portfolio_db',
            'cloudflared',
            'knowledge_web',
            'knowledge_db',
            'cloudflared-kb',
          ].includes(c.name)
        ),
        alerts: alerts,
        selfHealingCount: selfHealingCount,
        uptime: {
          portfolio: portfolioUptime,
          knowledge: knowledgeUptime,
        },
        responseTimes: responseTimes,
        heatmapData: heatmapData,
        pingHistory: pingHistory,
        weeklyPingHistory: weeklyPingHistory,
        serverStats: serverStats,
      },
    });
  } catch (error) {
    console.error('System stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
