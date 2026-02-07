diff --git a/app/api/ik-voel-me/route.ts b/app/api/ik-voel-me/route.ts
index af7484ad577951e0f11a6edec021adb001190d8f..a1eef931f0f09c85d865c9e2a4f6793e94e7dd68 100644
--- a/app/api/ik-voel-me/route.ts
+++ b/app/api/ik-voel-me/route.ts
@@ -1,29 +1,47 @@
 import { NextResponse } from "next/server";
 import { supabase } from "@/lib/supabase";
+import { getFallbackSteuntje } from "@/lib/steuntjeContent";
 
 export async function POST(req: Request) {
   try {
-    const { gevoel } = await req.json();
+    const body = (await req.json()) as { gevoel?: string };
+    const gevoel = body.gevoel?.trim().toLowerCase();
 
-    if (!gevoel || !gevoel.trim()) {
-      return NextResponse.json({ antwoord: "Ik hoor je." });
+    if (!gevoel) {
+      return NextResponse.json({ antwoord: "Ik hoor je. Je hoeft dit niet alleen te dragen." });
     }
 
-    const keyword = gevoel.toLowerCase().split(" ")[0];
+    if (!supabase) {
+      const fallback = getFallbackSteuntje();
+      return NextResponse.json({
+        antwoord: `${fallback.text} ${fallback.miniActie}`,
+      });
+    }
+
+    const woorden = gevoel.split(/\s+/).filter(Boolean);
 
-    const { data } = await supabase
+    const { data, error } = await supabase
       .from("gevoel_antwoorden")
-      .select("antwoord")
-      .ilike("keyword", `%${keyword}%`)
-      .limit(1)
-      .single();
+      .select("keyword, antwoord");
+
+    if (error || !data?.length) {
+      return NextResponse.json({
+        antwoord: "Dank je om dit te delen. Je bent welkom, precies zoals je je nu voelt.",
+      });
+    }
+
+    const match = data.find((rij) =>
+      woorden.some((woord) => woord.includes(rij.keyword) || rij.keyword.includes(woord))
+    );
 
     return NextResponse.json({
-      antwoord: data?.antwoord ?? "Dank je om dit te delen."
+      antwoord:
+        match?.antwoord ??
+        "Dank je om dit te delen. Adem zacht in en uit, en wees mild voor jezelf vandaag.",
     });
   } catch {
     return NextResponse.json({
-      antwoord: "Ik ben hier, ook als woorden even ontbreken."
+      antwoord: "Ik ben hier, ook als woorden even ontbreken.",
     });
   }
 }
