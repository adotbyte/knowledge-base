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
    
    // Skaičiuojame, kiek kartų buvo sėkmingai restartuota
    selfHealingCount = alerts.filter((a: any) => 
      a.message.includes('sėkmingai restartuotas') || a.message.includes('sėkmingai paleistas')
    ).length;
  } catch (e) { /* ignore */ }

    return NextResponse.json({
      success: true,
      data: {
        system: {
          load,
          memory: { total: memTotal, used: memUsed, free: memFree },
          uptimeDays,
          diskUsage,
          alerts: alerts,
          selfHealingCount: selfHealingCount,
        },
        websites: [
          { name: 'Portfolio (morkunas.info)', status: portfolioStatus },
          { name: 'Knowledge Base (knowledge.morkunas.info)', status: knowledgeStatus },
        ],
        containers: containers.filter((c: any) => 
          ['resume_website', 'portfolio_db', 'cloudflared', 'knowledge_web', 'knowledge_db', 'cloudflared-kb'].includes(c.name)
        ),
      },
    });
  } catch (error) {
    console.error('System stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}