import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const file = path.join(process.cwd(), 'db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter, { sites: [] })

export async function getDb() {
  await db.read()
  db.data ||= { sites: [] }
  return db
}

export async function addSiteData(siteData = {}) {
  const dbInstance = await getDb();
  dbInstance.data ||= { sites: [] };
  console.log(siteData);
  const siteEntry = {
    id: uuidv4(),
    siteInfo: siteData.siteInfo || {},
    performance: siteData.performance || {},
    issues: siteData.issues || [],
    createdAt: new Date().toISOString(),
  };

  dbInstance.data.sites.push(siteEntry);
  await dbInstance.write();

  return siteEntry.id;
}

export async function getSiteDataById(id) {
  const dbInstance = await getDb()
  return dbInstance.data.sites.find(s => s.id === id)
}

export async function getAllSites() {
  const dbInstance = await getDb()
  return dbInstance.data.sites
}

export async function deleteSiteData(id) {
  await db.read()
  db.data.sites = db.data.sites.filter((s) => s.id !== id)
  await db.write()
}
