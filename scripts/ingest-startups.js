import fs from "fs"
import csv from "csv-parser"
import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const BATCH_SIZE = 50
let batch = []
let total = 0
let skipped = 0

function isStartup(row) {
  return row.entity_type === "Company" || row.entity_type === "Product"
}

async function insertBatch(rows) {
  const { error } = await supabase.from("raw_startups").insert(
    rows.map((row) => ({
      source: "kaggle",
      external_id: row.id || row.permalink,
      name: row.name,
      data: row,
    }))
  )
  if (error) {
    console.error("Insert error:", error.message)
  } else {
    total += rows.length
    console.log(`Inserted ${total} startups so far...`)
  }
}

const stream = fs
  .createReadStream("data/objects.csv")
  .pipe(csv())
  .on("data", async (row) => {
    if (!isStartup(row)) {
      skipped++
      return
    }
    batch.push(row)
    if (batch.length >= BATCH_SIZE) {
      stream.pause()
      const toInsert = [...batch]
      batch = []
      await insertBatch(toInsert)
      stream.resume()
    }
  })
  .on("end", async () => {
    if (batch.length > 0) {
      await insertBatch(batch)
    }
    console.log(`Done! Inserted ${total} startups, skipped ${skipped} non-startups.`)
  })
  .on("error", (err) => {
    console.error("CSV read error:", err.message)
  })
