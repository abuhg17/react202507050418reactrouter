import { Application, Router, Context } from "https://deno.land/x/oak@v12.6.1/mod.ts"
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js"
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js"

const firebaseConfig = {
  apiKey: "AIzaSyBperuUWtP36lO_cRyGYSxuiTkhpy54F_Q",
  authDomain: "myvue3-e45b9.firebaseapp.com",
  projectId: "myvue3-e45b9",
  storageBucket: "myvue3-e45b9.firebasestorage.app",
  messagingSenderId: "439732498123",
  appId: "1:439732498123:web:46d43d1cb409e8678c754e",
  measurementId: "G-80R2D8D149",
}

const firebaseApp = initializeApp(firebaseConfig)
const db = getFirestore(firebaseApp)
const youtubeApiKey = "AIzaSyAUD7ipwX-VAIIgbtw4V6sHKOTfyWoPdMo"

const app = new Application()
const router = new Router()

router.get("/", (ctx: Context) => {
  ctx.response.headers.set("Content-Type", "text/plain; charset=utf-8")
  ctx.response.body = "Hello Deno"
})

router.get("/api/hello", (ctx: Context) => {
  ctx.response.headers.set("Content-Type", "application/json; charset=utf-8")
  ctx.response.body = {
    message: "Hello World.",
    message2: "こんにちは、世界。",
    message3: "世界，你好!",
  }
})

router.get("/api/firebasefood", async (ctx: Context) => {
  ctx.response.headers.set("Content-Type", "application/json; charset=utf-8")
  try {
    const myvue3foodCollection = collection(db, "myvue3food")
    const snapshot = await getDocs(myvue3foodCollection)
    const documents = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    ctx.response.body = { myvue3food: documents }
  } catch (error) {
    ctx.response.status = 500
    ctx.response.body = {
      error: "Failed to fetch data from Firestore",
      details: (error as Error).message,
    }
  }
})

router.get("/api/youtube/channel/:channelIds", async (ctx: Context) => {
  const channelIdsParam = ctx.params.channelIds
  if (!channelIdsParam) {
    ctx.response.status = 400
    ctx.response.body = { error: "請提供 channelIds 參數（可用逗號分隔多個）" }
    return
  }

  const channelIds = channelIdsParam.split(",").map((v) => v.trim()).filter((v) => v.length > 0)
  if (channelIds.length === 0 || channelIds.length > 50) {
    ctx.response.status = 400
    ctx.response.body = { error: "頻道 ID 數量需介於 1 到 50 之間" }
    return
  }

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/channels")
    url.searchParams.append("part", "snippet,statistics")
    url.searchParams.append("id", channelIds.join(","))
    url.searchParams.append("key", youtubeApiKey)

    const res = await fetch(url.toString(), {
      headers: {
        "Accept-Encoding": "gzip, deflate",
      },
    })

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const data = await res.json()
    const items = data?.items || []
    if (items.length === 0) {
      ctx.response.status = 404
      ctx.response.body = { error: "找不到任何頻道資料" }
      return
    }
    ctx.response.body = { count: items.length, items }
  } catch (error: any) {
    ctx.response.status = 500
    ctx.response.body = {
      error: "無法取得頻道資料",
      message: error.message,
      status: error.response?.status || null,
      response: error.response?.data || null,
    }
  }
})

router.get("/api/youtube/videos/:videoIds", async (ctx: Context) => {
  const videoIdsParam = ctx.params.videoIds
  if (!videoIdsParam) {
    ctx.response.status = 400
    ctx.response.body = { error: "請提供 videoIds 參數（可用逗號分隔多個）" }
    return
  }

  const videoIds = videoIdsParam.split(",").map((v) => v.trim()).filter((v) => v.length > 0)
  if (videoIds.length === 0 || videoIds.length > 50) {
    ctx.response.status = 400
    ctx.response.body = { error: "影片 ID 數量需介於 1 到 50 之間" }
    return
  }

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/videos")
    url.searchParams.append("part", "snippet,statistics")
    url.searchParams.append("id", videoIds.join(","))
    url.searchParams.append("key", youtubeApiKey)

    const res = await fetch(url.toString(), {
      headers: {
        "Accept-Encoding": "gzip, deflate",
      },
    })

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const data = await res.json()
    const items = data?.items || []
    if (items.length === 0) {
      ctx.response.status = 404
      ctx.response.body = { error: "找不到任何影片資料" }
      return
    }
    ctx.response.body = { count: items.length, items }
  } catch (error: any) {
    ctx.response.status = 500
    ctx.response.body = {
      error: "無法取得影片資料",
      message: error.message,
      status: error.response?.status || null,
      response: error.response?.data || null,
    }
  }
})

router.get("/api/countdown/:slug", (ctx: Context) => {
  const slug = ctx.params.slug
  if (!slug || slug.length < 12) {
    ctx.response.status = 400
    ctx.response.body = { error: "Invalid slug. Format should be: YYYYMMDDHHMM" }
    return
  }

  const slugISO = `${slug.slice(0, 4)}-${slug.slice(4, 6)}-${slug.slice(6, 8)}T${slug.slice(8, 10)}:${slug.slice(10, 12)}:00+08:00`
  const now = new Date()
  const next = new Date(slugISO)

  const diffMs = next.getTime() - now.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  let remaining = diffSec

  const diffday = Math.floor(remaining / 86400)
  remaining -= diffday * 86400
  const diffhour = Math.floor(remaining / 3600)
  remaining -= diffhour * 3600
  const diffminute = Math.floor(remaining / 60)
  const diffsecond = remaining % 60

  ctx.response.body = {
    slug,
    now: now.toISOString(),
    slugISO,
    next: next.toISOString(),
    diffMs,
    diffday,
    diffhour,
    diffminute,
    diffsecond,
  }
})

router.get("/api/bilibili/:bvid", async (ctx: Context) => {
  ctx.response.headers.set("Content-Type", "application/json; charset=utf-8")
  const bvid = ctx.params.bvid
  if (!bvid) {
    ctx.response.status = 400
    ctx.response.body = { error: "請提供 bvid 參數" }
    return
  }

  try {
    const url = new URL("https://api.bilibili.com/x/web-interface/view")
    url.searchParams.append("bvid", bvid)

    const res = await fetch(url.toString(), {
      headers: {
        Referer: "https://www.bilibili.com/",
        "Accept-Encoding": "gzip, deflate",
      },
    })

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const data = await res.json()
    const { pic, title, owner, stat, pages } = data.data
    const raw = data.data
    const newdata: Record<string, any> = {}
    for (const key in raw) {
      if (typeof raw[key] !== "object") newdata[key] = raw[key]
    }

    ctx.response.body = { pic, title, owner, stat, data: newdata, pages }
  } catch (error: any) {
    ctx.response.status = 500
    ctx.response.body = {
      error: "無法取得 Bilibili 資料",
      message: error.message,
      status: error.response?.status || null,
      response: error.response?.data || null,
    }
  }
})

router.get("/api/bilibili/proxyimg", async (ctx: Context) => {
  const urlParam = ctx.request.url.searchParams.get("url")
  if (!urlParam) {
    ctx.response.status = 400
    ctx.response.body = { error: "請提供 url 參數" }
    return
  }

  try {
    const response = await fetch(urlParam, {
      headers: {
        Referer: "https://www.bilibili.com/",
        "Accept-Encoding": "gzip, deflate",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    ctx.response.headers.set("Content-Type", response.headers.get("content-type") || "application/octet-stream")
    ctx.response.headers.set("Cache-Control", "public, max-age=86400")
    ctx.response.body = response.body
  } catch (err: any) {
    ctx.response.status = 500
    ctx.response.body = { error: "圖片代理失敗", message: err.message }
  }
})

app.use(router.routes())
app.use(router.allowedMethods())

console.log(`Deno server running on http://localhost:3000`)
await app.listen({ port: 3000 })


