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
  const { error } = await supabase.from("raw_investors").insert(
    rows.map((row) => ({
      source: "kaggle-investments",
      name: row.investor_object_id || row.investor_name,
      data: row,
    }))
  )
  if (error) {
    console.error("Insert error:", error.message)
  } else {
    total += rows.length
    console.log(`Inserted ${total} investments so far...`)
  }
}

const stream = fs
  .createReadStream("data/investments.csv")
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
    console.log(`Done! Inserted ${total} investments.`)
  })
  .on("error", (err) => {
    console.error("CSV read error:", err.message)
  })
