import { NextResponse } from 'next/server';
import fs from 'node:fs';
import os from 'node:os';
import { execSync } from 'node:child_process';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Nuskaitome CPU apkrovimą
    const loadAvg = os.loadavg();
    const load = `${loadAvg[0].toFixed(2)}, ${loadAvg[1].toFixed(2)}, ${loadAvg[2].toFixed(2)}`;

    // 2. Nuskaitome RAM iš /proc/meminfo (kaip darėme portfolio)
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
    } catch (e) { console.error('Nepavyko perskaityti meminfo:', e); }

    // 3. Uptime
    let uptimeDays = 0;
    try {
      const uptimeInfo = fs.readFileSync('/host/proc/uptime', 'utf8');
      uptimeDays = Math.floor(parseFloat(uptimeInfo.split(' ')[0]) / 86400);
    } catch (e) { console.error('Nepavyko perskaityti uptime:', e); }

    // 4. Disko užimtumas
    let diskUsage = "0%";
    try {
      const dfOutput = execSync('df -h / | tail -1').toString().trim();
      const parts = dfOutput.split(/\s+/);
      diskUsage = parts[4]; // Use% stulpelis
    } catch (e) { console.error('Nepavyko patikrinti disko:', e); }

    // 5. Docker konteineriai
    let containers: any[] = [];
    try {
      // Gauname sąrašą per mūsų socket-proxy
      const dockerRes = await fetch('http://socket-proxy:2375/containers/json?all=true', { cache: 'no-store' });
      if (dockerRes.ok) {
        const data = await dockerRes.json();
        containers = data.map((c: any) => ({
          name: c.Names[0].replace('/', ''),
          state: c.State, // running, exited, etc.
          image: c.Image,
        }));
      }
    } catch (e) { console.error('Nepavyko pasiekti Docker:', e); }

    return NextResponse.json({
      success: true,
      data: {
        load,
        memory: { total: memTotal, used: memUsed, free: memFree },
        uptimeDays,
        diskUsage,
        containers,
      },
    });
  } catch (error) {
    console.error('System stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}