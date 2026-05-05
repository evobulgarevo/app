import fs from "fs"
import csv from "csv-parser"
import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const BATCH_SIZE = 50
let batch = []
let total = 0

async function insertBatch(rows) {
  const { error } = await supabase.from("raw_funding_rounds").insert(
    rows.map((row) => ({
      source: "kaggle-funding",
      external_id: row.id || row.funding_round_id,
      name: row.company_name || row.object_id,
      data: row,
    }))
  )
  if (error) {
    console.error("Insert error:", error.message)
  } else {
    total += rows.length
    console.log(`Inserted ${total} funding rounds so far...`)
  }
}

const stream = fs
  .createReadStream("data/funding_rounds.csv")
  .pipe(csv())
  .on("data", async (row) => {
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
    console.log(`Done! Inserted ${total} funding rounds.`)
  })
  .on("error", (err) => {
    console.error("CSV read error:", err.message)
  })
