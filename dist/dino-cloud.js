(function () {
  var CFG = window.DINO_SUPABASE || {};
  var configured = !!(CFG.url && CFG.anonKey);
  var clientP = null;

  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  function client() {
    if (!configured) return Promise.reject(new Error("서버가 연결되지 않았습니다"));
    if (!clientP) {
      clientP = (window.supabase ? Promise.resolve() : loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"))
        .then(function () {
          return window.supabase.createClient(CFG.url, CFG.anonKey, { auth: { persistSession: true, storageKey: "dinobird-auth" } });
        });
    }
    return clientP;
  }

  function sessionId() {
    try {
      var id = sessionStorage.getItem("dinobird-sid");
      if (!id) { id = Math.random().toString(36).slice(2) + Date.now().toString(36); sessionStorage.setItem("dinobird-sid", id); }
      return id;
    } catch (e) { return "anon"; }
  }

  function source() {
    try {
      var q = new URLSearchParams(location.search).get("utm_source");
      if (q) return q.toLowerCase();
      var r = document.referrer ? new URL(document.referrer).hostname : "";
      if (!r || r === location.hostname) return "direct";
      if (/instagram/.test(r)) return "instagram";
      if (/naver/.test(r)) return "naver";
      if (/google/.test(r)) return "google";
      if (/youtube|youtu\.be/.test(r)) return "youtube";
      if (/facebook|fb\./.test(r)) return "facebook";
      if (/kakao/.test(r)) return "kakao";
      return r;
    } catch (e) { return "direct"; }
  }

  function device() {
    var w = window.innerWidth || 1024;
    return w < 700 ? "mobile" : w < 1100 ? "tablet" : "desktop";
  }

  function unwrap(res) { if (res.error) throw res.error; return res.data; }

  window.DinoCloud = {
    configured: configured,
    adminEmail: CFG.adminEmail || "",

    loadContent: function () {
      return client().then(function (c) { return c.from("site_content").select("data").eq("id", "main").maybeSingle(); })
        .then(unwrap).then(function (row) { return row ? row.data : null; });
    },
    saveContent: function (data) {
      return client().then(function (c) { return c.from("site_content").upsert({ id: "main", data: data, updated_at: new Date().toISOString() }); }).then(unwrap);
    },
    subscribeContent: function (cb) {
      return client().then(function (c) {
        return c.channel("site-content")
          .on("postgres_changes", { event: "*", schema: "public", table: "site_content" }, function (p) { if (p.new && p.new.data) cb(p.new.data); })
          .subscribe();
      });
    },

    signIn: function (email, password) {
      return client().then(function (c) { return c.auth.signInWithPassword({ email: email, password: password }); }).then(unwrap);
    },
    signOut: function () { return client().then(function (c) { return c.auth.signOut(); }); },
    getSession: function () {
      return client().then(function (c) { return c.auth.getSession(); }).then(unwrap).then(function (d) { return d.session; });
    },

    upload: function (file, folder) {
      var safe = String(file.name || "file").toLowerCase().replace(/[^a-z0-9.\-]+/g, "-");
      var path = (folder || "misc") + "/" + Date.now().toString(36) + "-" + safe;
      return client().then(function (c) {
        return c.storage.from("media").upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type || undefined })
          .then(unwrap).then(function () { return c.storage.from("media").getPublicUrl(path).data.publicUrl; });
      });
    },

    submitInquiry: function (form) {
      return client().then(function (c) {
        return c.from("inquiries").insert({ name: form.name || "", email: form.email || "", brief: form.brief || "" });
      }).then(unwrap);
    },
    listInquiries: function () {
      return client().then(function (c) { return c.from("inquiries").select("*").order("created_at", { ascending: false }).limit(300); }).then(unwrap);
    },
    setInquiryStatus: function (id, status) {
      return client().then(function (c) { return c.from("inquiries").update({ status: status }).eq("id", id); }).then(unwrap);
    },

    track: function (path) {
      if (!configured) return;
      client().then(function (c) {
        return c.from("page_views").insert({
          path: path, source: source(), referrer: document.referrer || "", device: device(), session_id: sessionId()
        });
      }).catch(function () {});
    },
    pageViews: function (days) {
      var since = new Date(Date.now() - days * 86400000).toISOString();
      return client().then(function (c) {
        return c.from("page_views").select("path,source,device,session_id,created_at").gte("created_at", since).order("created_at", { ascending: true }).limit(50000);
      }).then(unwrap);
    }
  };
})();
