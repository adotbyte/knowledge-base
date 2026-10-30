import { NextResponse } from 'next/server';
import fs from 'node:fs';
import os from 'node:os';
import { execSync } from 'node:child_process';
import { unstable_noStore as noStore } from 'next/cache';
import { readFileSync } from 'fs';

export async function GET() {
  noStore();
  try {
    // 1. Sistemos resursai (CPU, RAM, Diskas)
    const loadAvg = os.loadavg();
    const load = `${loadAvg[0].toFixed(2)}, ${loadAvg[1].toFixed(2)}, ${loadAvg[2].toFixed(2)}`;

    let memTotal = "0G", memUsed = "0G", memFree = "0G";
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
    } catch (e) { /* ignore */ }

    let uptimeDays = 0;
    try {
      const uptimeInfo = fs.readFileSync('/host/proc/uptime', 'utf8');
      uptimeDays = Math.floor(parseFloat(uptimeInfo.split(' ')[0]) / 86400);
    } catch (e) { /* ignore */ }

    let diskUsage = "0%";
    try {
      const dfOutput = execSync('df -h / | tail -1').toString().trim();
      diskUsage = dfOutput.split(/\s+/)[4];
    } catch (e) { /* ignore */ }

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
      const dockerRes = await fetch('http://socket-proxy:2375/containers/json?all=true', { cache: 'no-store' });
      if (dockerRes.ok) {
        const data = await dockerRes.json();
        containers = data.map((c: any) => ({
          name: c.Names[0].replace('/', ''),
          state: c.State,
        }));
      }
    } catch (e) { /* ignore */ }

  // 4. Nuskaitome aliarmų istoriją
  let alerts: any[] = [];
  let selfHealingCount = 0;
  try {
    const alertsFile = readFileSync('/host/tmp/alerts_history.log', 'utf8');
    alerts = alertsFile.trim().split('\n').map(line => JSON.parse(line)).reverse();
    
    selfHealingCount = alerts.filter((a: any) => 
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
    
    let pfTotal = 0, pfUp = 0;
    let kbTotal = 0, kbUp = 0;

    lines.forEach(line => {
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

    // 6. Renkame atsako laikus grafikui (paskutiniai 20 patikrinimų)
  let responseTimes: any[] = [];
  try {
    const uptimeFile = readFileSync('/host/tmp/uptime_history.log', 'utf8');
    const lines = uptimeFile.trim().split('\n').filter(Boolean).slice(-40); // Imame paskutinius 40 (20 portfolio + 20 kb)

    let pfData: any[] = [];
    let kbData: any[] = [];

    lines.forEach(line => {
      const parts = line.split(' ');
      if (parts.length === 3) {
        // Portfolio: timestamp status time
        pfData.push({ time: parseInt(parts[0]), responseTime: parseFloat(parts[2]) });
      } else if (parts.length === 4 && parts[0] === 'kb') {
        // KB: kb timestamp status time
        kbData.push({ time: parseInt(parts[1]), responseTime: parseFloat(parts[3]) });
      }
    });

    // Sujungiame ir paverčiame į gražų formatą grafikui
    const allData = [
      ...pfData.map(d => ({ name: isNaN(d.time) ? '--:--' : new Date(d.time * 1000).toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit' }), Portfolio: d.responseTime })),
      ...kbData.map(d => ({ name: isNaN(d.time) ? '--:--' : new Date(d.time * 1000).toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit' }), Knowledge: d.responseTime }))
    ];

    // Surikiuojame pagal laiką
    responseTimes = allData.sort((a, b) => a.name.localeCompare(b.name)).slice(-20);
  } catch (e) { /* ignore */ }

    // 7. Grupuojame aliarmus pagal savaitės dieną ir valandą
  const heatmapData: any[] = [];
  const days = ['Sekmadienis', 'Pirmadienis', 'Antradienis', 'Trečiadienis', 'Ketvirtadienis', 'Penktadienis', 'Šeštadienis'];
  
  // Sukuriame tuščią tinklelį
  for (let h = 0; h < 24; h++) {
    const row: any = { hour: `${h.toString().padStart(2, '0')}:00` };
    days.forEach(day => row[day] = 0);
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
    } catch (e) { /* ignore */ }
  });

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
          ['resume_website', 'portfolio_db', 'cloudflared', 'knowledge_web', 'knowledge_db', 'cloudflared-kb'].includes(c.name)
        ),
        alerts: alerts,
        selfHealingCount: selfHealingCount,
        uptime: {
          portfolio: portfolioUptime,
          knowledge: knowledgeUptime,
        },
        responseTimes: responseTimes,
        heatmapData: heatmapData,
      },
    });
  } catch (error) {
    console.error('System stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}