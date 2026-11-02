// Knowledge base offline bot Kala (jalan di client-side tanpa backend)

export const CHATBOT_CONFIG = {
  botName: "Kala",
  botTitle: "Asisten Budaya Bali",
  welcomeMessage:
    "Om Swastyastu! 🙏 Selamat datang di <strong>Sekala</strong>. Saya <strong>Kala</strong>, asisten virtual yang siap menemani Anda menjelajahi keindahan seni, tradisi, dan filosofi luhur Pulau Bali. Ada yang ingin Anda tanyakan?",
  quickChips: [
    "Apa itu Sekala?",
    "Tradisi unik di Badung",
    "Tradisi Siat Yeh",
    "Makna Tri Hita Karana",
    "Upacara Ngaben",
    "Peta Wilayah Bali",
  ],
};

const CULTURAL_KNOWLEDGE_BASE = [
  // Informasi seputar Sekala & navigasi
  {
    keywords: [
      "apa itu sekala",
      "tentang sekala",
      "tujuan sekala",
      "visi sekala",
      "platform sekala",
    ],
    answer:
      "<strong>Sekala</strong> adalah platform digital dokumentasi dan edukasi kebudayaan Bali. Nama 'Sekala' merujuk pada konsep filosofi Bali tentang dunia nyata/kasat mata yang kita lihat dan jaga. Platform ini menghadirkan eksplorasi peta wilayah interaktif, katalog tradisi adiluhung, dan artikel mendalam.",
  },
  {
    keywords: [
      "halaman",
      "fitur",
      "menu",
      "navigasi",
      "cara pakai",
      "eksplorasi",
    ],
    answer:
      "Di Sekala Anda dapat menjelajahi: <br>• <strong>Peta Wilayah:</strong> Peta 3D/2D interaktif 8 kabupaten & 1 kota di Bali.<br>• <strong>Daftar Tradisi:</strong> Rangkuman tradisi unik seperti Siat Yeh, Kebo Dongol, hingga Perang Papah.<br>• <strong>Artikel Budaya:</strong> Ulasan mendalam seputar filosofi, seni pertunjukan, dan pelestarian adat.",
  },

  // Tradisi Badung & daerah lainnya
  {
    keywords: ["badung", "tradisi badung", "tradisi di badung"],
    answer:
      "Kabupaten <strong>Badung</strong> memiliki beragam tradisi sakral yang kaya, di antaranya:<br>• <strong>Siat Tipat Bantal</strong> (Desa Kapal): perang ketupat lambang kesuburan.<br>• <strong>Siat Yeh</strong> (Jimbaran): perang air suci penyucian diri menyambut Ngembak Geni.<br>• <strong>Kebo Dongol</strong> (Kapal): persembahan figur kerbau dari ketan hitam.<br>• <strong>Mekotek</strong> (Munggu): formasi piramida tongkat kayu pusaka.",
  },
  {
    keywords: ["siat yeh", "perang air", "jimbaran"],
    answer:
      "<strong>Tradisi Siat Yeh</strong> dilaksanakan di Desa Adat Jimbaran sehari setelah Hari Raya Nyepi (Ngembak Geni). Pemuda-pemudi desa saling menyiram air dari dua sumber mata air (pantai timur dan barat) sebagai simbol pembersihan noda diri dan mempererat persaudaraan.",
  },
  {
    keywords: ["siat tipat", "tipat bantal", "desa kapal"],
    answer:
      "<strong>Siat Tipat Bantal</strong> adalah tradisi lempar ketupat (simbol feminim) dan bantal (simbol maskulin) oleh warga Desa Adat Kapal, Badung. Tradisi ini adalah ungkapan rasa syukur kepada Ida Sang Hyang Widhi Wasa atas kesuburan tanah dan hasil panen melimpah.",
  },
  {
    keywords: ["kebo dongol", "dongol"],
    answer:
      "<strong>Tradisi Kebo Dongol</strong> di Desa Kapal, Badung, melibatkan pembuatan sesaji berbentuk kerbau yang terbuat dari olahan beras ketan hitam. Tradisi ini diselenggarakan sebagai simbol permohonan keselamatan dan tolak bala bagi seluruh warga.",
  },
  {
    keywords: ["mekotek", "munggu", "tongkat mekotek"],
    answer:
      "<strong>Mekotek</strong> digelar di Desa Munggu, Badung setiap Hari Raya Kuningan. Ribuan krama membawa tongkat kayu setinggi 2,5 meter yang dipadukan menjadi piramida kerucut berdentang nyaring untuk memohon perlindungan dari mara bahaya.",
  },
  {
    keywords: ["omed omedan", "sesetan", "denpasar", "tarik menarik"],
    answer:
      "<strong>Omed-omedan</strong> adalah tradisi khas pemuda-pemudi Banjar Kaja, Sesetan, Denpasar usai Nyepi. Pemuda dan pemudi saling berpelukan dan ditarik oleh warga lain sambil disiram air, bermakna menjaga keharmonisan dan rasa kebersamaan.",
  },
  {
    keywords: ["perang papah", "pelepah", "tenganan", "karangasem"],
    answer:
      "<strong>Perang Papah</strong> di Desa Adat Tenganan Pegringsingan, Karangasem, merupakan tradisi adu ketangkasan menggunakan pelepah kelapa dan tameng anyaman rotan sebagai wujud pemujaan kepada Dewa Indra.",
  },
  {
    keywords: ["makepung", "jembrana", "balap kerbau"],
    answer:
      "<strong>Makepung</strong> adalah atraksi pacuan kerbau tradisional khas Jembrana, Bali Barat. Tradisi yang lahir dari kegembiraan petani saat membajak sawah ini kini menjadi ikon sport-tourism budaya dengan kerbau yang dihias megah.",
  },
  {
    keywords: ["mesuryak", "tabanan", "bongan", "lempar uang"],
    answer:
      "<strong>Mesuryak</strong> diadakan di Desa Bongan, Tabanan bertepatan dengan Hari Raya Kuningan. Warga bersorak gembira sambil melemparkan uang kertas/koin ke udara sebagai simbol penghormatan dan bekal kepulangan para leluhur ke alam sunia.",
  },

  // Filosofi budaya & agama Hindu Bali
  {
    keywords: ["tri hita karana", "filosofi bali", "makna tri hita karana"],
    answer:
      "<strong>Tri Hita Karana</strong> adalah tiga penyebab terciptanya kebahagiaan dan keharmonisan hidup masyarakat Bali:<br>1. <strong>Parhyangan:</strong> Hubungan harmonis manusia dengan Sang Pencipta.<br>2. <strong>Pawongan:</strong> Hubungan harmonis antar sesama manusia.<br>3. <strong>Palemahan:</strong> Hubungan harmonis manusia dengan alam dan lingkungan.",
  },
  {
    keywords: ["ngaben", "upacara ngaben", "kremasi", "pitra yadnya"],
    answer:
      "<strong>Ngaben</strong> adalah upacara pembakaran jenazah atau kremasi suci (Pitra Yadnya) dalam tradisi Hindu Bali. Tujuannya adalah mengembalikan unsur panca maha butha (lima elemen penyusun tubuh kasar) kembali ke asalnya di alam semesta agar roh dapat bersatu menuju alam suci.",
  },
  {
    keywords: ["nyepi", "hari raya nyepi", "catur brata"],
    answer:
      "<strong>Hari Raya Nyepi</strong> adalah tahun baru Saka di Bali yang dirayakan dengan keheningan melalui <em>Catur Brata Penyepian</em>:<br>• <strong>Amati Geni:</strong> Tidak menyalakan api/cahaya.<br>• <strong>Amati Karya:</strong> Tidak bekerja.<br>• <strong>Amati Lelungan:</strong> Tidak bepergian.<br>• <strong>Amati Lelanguan:</strong> Tidak bersenang-senang.",
  },
  {
    keywords: ["ogoh ogoh", "pengerupukan"],
    answer:
      "<strong>Ogoh-ogoh</strong> adalah patung raksasa berwujud bhuta kala yang diarak keliling desa pada malam <em>Pengerupukan</em> (sehari sebelum Nyepi). Tujuannya adalah menetralisir energi negatif alam semesta sebelum memasuki keheningan Nyepi.",
  },
  {
    keywords: ["kabupaten", "wilayah bali", "peta wilayah"],
    answer:
      "Provinsi Bali memiliki <strong>8 Kabupaten</strong> dan <strong>1 Kota</strong>: Badung, Bangli, Buleleng, Gianyar, Jembrana, Karangasem, Klungkung, Tabanan, dan Kota Denpasar. Anda dapat melihat peta 3D interaktifnya di menu <strong>Wilayah</strong>!",
  },

  // Sapaan & interaksi umum
  {
    keywords: ["halo", "hai", "hello", "hi", "pagi", "siang", "sore", "malam"],
    answer:
      "Halo! Senang bisa menyapa Anda. Saya <strong>Kala</strong> siap membantu menjawab keingintahuan Anda tentang kebudayaan, seni, dan tradisi Bali. Apa topik yang ingin Anda telusuri hari ini?",
  },
  {
    keywords: ["om swastyastu", "swastiastu", "om swastiastu"],
    answer:
      "Om Swastyastu! 🙏 Semoga damai dan kebaikan senantiasa datang dari segala penjuru. Ada tradisi atau wilayah di Bali yang ingin Anda ketahui lebih jauh?",
  },
  {
    keywords: ["terima kasih", "makasih", "suksma"],
    answer:
      "Matur suksma! 🙏 Senang bisa membantu Anda belajar dan melestarikan budaya Bali. Jangan ragu bertanya lagi ya!",
  },
];

// Keyword scoring sederhana buat matching query user ke knowledge base
export function getChatbotResponse(userQuery) {
  if (!userQuery || !userQuery.trim()) {
    return "Silakan ketik pertanyaan Anda seputar tradisi atau budaya Bali.";
  }

  const queryClean = userQuery.toLowerCase().trim();
  const queryTokens = queryClean.split(/\s+/).filter((t) => t.length > 2);

  let bestMatch = null;
  let highestScore = 0;

  for (const entry of CULTURAL_KNOWLEDGE_BASE) {
    let score = 0;

    for (const kw of entry.keywords) {
      // Exact phrase match (skor lebih tinggi)
      if (queryClean.includes(kw)) {
        score += 10 + kw.length;
      }

      // Token overlap match
      const kwTokens = kw.split(/\s+/);
      for (const token of queryTokens) {
        if (kwTokens.includes(token)) {
          score += 4;
        } else if (kw.includes(token)) {
          score += 2;
        }
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = entry;
    }
  }

  // Kembalikan jawaban terbaik kalau skor match cukup
  if (bestMatch && highestScore >= 4) {
    return bestMatch.answer.replace(/\s*—\s*/g, ": ");
  }

  // Fallback kalau query nggak ada yang cocok
  return (
    "Maaf, saya belum memiliki informasi mendalam mengenai hal tersebut. 🙏<br><br>" +
    "Anda bisa mencoba menanyakan topik seperti: <br>" +
    "• <em>'Tradisi Siat Yeh di Jimbaran'</em><br>" +
    "• <em>'Siat Tipat Bantal di Kapal'</em><br>" +
    "• <em>'Makna Tri Hita Karana'</em><br>" +
    "• <em>'Daftar tradisi di Badung'</em>"
  );
}
