import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Data 80 Emiten Konstituen Indeks IDX80 (Bursa Efek Indonesia)
const IDX80_STOCKS = [
  { symbol: "ACES", companyName: "Aspirasi Hidup Indonesia Tbk.", sector: "Consumer Cyclicals", industry: "Specialty Retail" },
  { symbol: "ADMR", companyName: "Adaro Minerals Indonesia Tbk.", sector: "Energy", industry: "Coal" },
  { symbol: "ADRO", companyName: "Adaro Energy Indonesia Tbk.", sector: "Energy", industry: "Thermal Coal" },
  { symbol: "AKRA", companyName: "AKR Corporindo Tbk.", sector: "Energy", industry: "Oil & Gas Distribution" },
  { symbol: "AMMN", companyName: "Amman Mineral Internasional Tbk.", sector: "Basic Materials", industry: "Copper & Gold Mining" },
  { symbol: "AMRT", companyName: "Sumber Alfaria Trijaya Tbk.", sector: "Consumer Non-Cyclicals", industry: "Food Retail" },
  { symbol: "ANTM", companyName: "Aneka Tambang Tbk.", sector: "Basic Materials", industry: "Diversified Metals & Mining" },
  { symbol: "ARTO", companyName: "Bank Jago Tbk.", sector: "Financials", industry: "Digital Banking" },
  { symbol: "ASII", companyName: "Astra International Tbk.", sector: "Industrials", industry: "Automotive & Conglomerate" },
  { symbol: "AVIA", companyName: "Avia Avian Tbk.", sector: "Basic Materials", industry: "Specialty Chemicals" },
  { symbol: "BBCA", companyName: "Bank Central Asia Tbk.", sector: "Financials", industry: "Diversified Banking" },
  { symbol: "BBNI", companyName: "Bank Negara Indonesia (Persero) Tbk.", sector: "Financials", industry: "Diversified Banking" },
  { symbol: "BBRI", companyName: "Bank Rakyat Indonesia (Persero) Tbk.", sector: "Financials", industry: "Microfinance & Commercial Banking" },
  { symbol: "BBTN", companyName: "Bank Tabungan Negara (Persero) Tbk.", sector: "Financials", industry: "Mortgage Banking" },
  { symbol: "BDMN", companyName: "Bank Danamon Indonesia Tbk.", sector: "Financials", industry: "Diversified Banking" },
  { symbol: "BFIN", companyName: "BFI Finance Indonesia Tbk.", sector: "Financials", industry: "Consumer Financing" },
  { symbol: "BMRI", companyName: "Bank Mandiri (Persero) Tbk.", sector: "Financials", industry: "Corporate & Commercial Banking" },
  { symbol: "BNGA", companyName: "Bank CIMB Niaga Tbk.", sector: "Financials", industry: "Commercial Banking" },
  { symbol: "BRIS", companyName: "Bank Syariah Indonesia Tbk.", sector: "Financials", industry: "Islamic Banking" },
  { symbol: "BRPT", companyName: "Barito Pacific Tbk.", sector: "Basic Materials", industry: "Petrochemicals & Energy" },
  { symbol: "BSSR", companyName: "Baramulti Suksessarana Tbk.", sector: "Energy", industry: "Coal" },
  { symbol: "BTPS", companyName: "Bank BTPN Syariah Tbk.", sector: "Financials", industry: "Islamic Microfinance" },
  { symbol: "BUKA", companyName: "Bukalapak.com Tbk.", sector: "Technology", industry: "E-Commerce" },
  { symbol: "CPIN", companyName: "Charoen Pokphand Indonesia Tbk.", sector: "Consumer Non-Cyclicals", industry: "Poultry & Animal Feed" },
  { symbol: "CTRA", companyName: "Ciputra Development Tbk.", sector: "Properties & Real Estate", industry: "Property Development" },
  { symbol: "DOID", companyName: "Delta Dunia Makmur Tbk.", sector: "Energy", industry: "Mining Services" },
  { symbol: "ELSA", companyName: "Elnusa Tbk.", sector: "Energy", industry: "Oil & Gas Services" },
  { symbol: "EMTK", companyName: "Elang Mahkota Teknologi Tbk.", sector: "Technology", industry: "Media & Tech Conglomerate" },
  { symbol: "ENRG", companyName: "Energi Mega Persada Tbk.", sector: "Energy", industry: "Oil & Gas Exploration" },
  { symbol: "ERAA", companyName: "Erajaya Swasembada Tbk.", sector: "Consumer Cyclicals", industry: "Consumer Electronics Retail" },
  { symbol: "EXCL", companyName: "XL Axiata Tbk.", sector: "Telecommunication", industry: "Wireless Telecommunications" },
  { symbol: "GGRM", companyName: "Gudang Garam Tbk.", sector: "Consumer Non-Cyclicals", industry: "Tobacco" },
  { symbol: "GOTO", companyName: "GoTo Gojek Tokopedia Tbk.", sector: "Technology", industry: "On-demand & Digital Services" },
  { symbol: "HEAL", companyName: "Medikaloka Hermina Tbk.", sector: "Healthcare", industry: "Hospital Services" },
  { symbol: "HRUM", companyName: "Harum Energy Tbk.", sector: "Energy", industry: "Coal & Nickel Mining" },
  { symbol: "ICBP", companyName: "Indofood CBP Sukses Makmur Tbk.", sector: "Consumer Non-Cyclicals", industry: "Packaged Food" },
  { symbol: "INCO", companyName: "Vale Indonesia Tbk.", sector: "Basic Materials", industry: "Nickel Mining" },
  { symbol: "INDF", companyName: "Indofood Sukses Makmur Tbk.", sector: "Consumer Non-Cyclicals", industry: "Agribusiness & Food Processing" },
  { symbol: "INDY", companyName: "Indika Energy Tbk.", sector: "Energy", industry: "Coal & Diversified Energy" },
  { symbol: "INKP", companyName: "Indah Kiat Pulp & Paper Tbk.", sector: "Basic Materials", industry: "Paper & Forest Products" },
  { symbol: "INTP", companyName: "Indocement Tunggal Prakarsa Tbk.", sector: "Basic Materials", industry: "Cement" },
  { symbol: "ISAT", companyName: "Indosat Ooredoo Hutchison Tbk.", sector: "Telecommunication", industry: "Wireless Telecommunications" },
  { symbol: "ITMG", companyName: "Indo Tambangraya Megah Tbk.", sector: "Energy", industry: "Thermal Coal" },
  { symbol: "JPFA", companyName: "JAPFA Comfeed Indonesia Tbk.", sector: "Consumer Non-Cyclicals", industry: "Poultry Processing" },
  { symbol: "JSMR", companyName: "Jasa Marga (Persero) Tbk.", sector: "Infrastructures", industry: "Toll Road Operations" },
  { symbol: "KLBF", companyName: "Kalbe Farma Tbk.", sector: "Healthcare", industry: "Pharmaceuticals" },
  { symbol: "MAPI", companyName: "Mitra Adiperkasa Tbk.", sector: "Consumer Cyclicals", industry: "Apparel & Department Retail" },
  { symbol: "MAPA", companyName: "MAP Aktif Adiperkasa Tbk.", sector: "Consumer Cyclicals", industry: "Sports & Leisure Retail" },
  { symbol: "MBMA", companyName: "Merdeka Battery Materials Tbk.", sector: "Basic Materials", industry: "EV Battery Materials & Nickel" },
  { symbol: "MDKA", companyName: "Merdeka Copper Gold Tbk.", sector: "Basic Materials", industry: "Gold & Copper Mining" },
  { symbol: "MEDC", companyName: "Medco Energi Internasional Tbk.", sector: "Energy", industry: "Oil & Gas Production" },
  { symbol: "MIKA", companyName: "Mitra Keluarga Karyasehat Tbk.", sector: "Healthcare", industry: "Hospitals" },
  { symbol: "MNCN", companyName: "Media Nusantara Citra Tbk.", sector: "Consumer Cyclicals", industry: "Broadcasting & Media" },
  { symbol: "MYOR", companyName: "Mayora Indah Tbk.", sector: "Consumer Non-Cyclicals", industry: "Packaged Foods & Beverages" },
  { symbol: "NISP", companyName: "Bank OCBC NISP Tbk.", sector: "Financials", industry: "Commercial Banking" },
  { symbol: "PGAS", companyName: "Perusahaan Gas Negara Tbk.", sector: "Energy", industry: "Natural Gas Utilities" },
  { symbol: "PGEO", companyName: "Pertamina Geothermal Energy Tbk.", sector: "Infrastructures", industry: "Renewable Energy & Geothermal" },
  { symbol: "PNBN", companyName: "Bank Pan Indonesia Tbk.", sector: "Financials", industry: "Commercial Banking" },
  { symbol: "PTBA", companyName: "Bukit Asam Tbk.", sector: "Energy", industry: "Coal Mining" },
  { symbol: "PTPP", companyName: "PP (Persero) Tbk.", sector: "Infrastructures", industry: "Construction & Engineering" },
  { symbol: "PWON", companyName: "Pakuwon Jati Tbk.", sector: "Properties & Real Estate", industry: "Mall & Residential Properties" },
  { symbol: "SCMA", companyName: "Surya Citra Media Tbk.", sector: "Consumer Cyclicals", industry: "Broadcasting" },
  { symbol: "SIDO", companyName: "Industri Jamu Dan Farmasi Sido Muncul Tbk.", sector: "Healthcare", industry: "Herbal Medicine" },
  { symbol: "SMGR", companyName: "Semen Indonesia (Persero) Tbk.", sector: "Basic Materials", industry: "Cement" },
  { symbol: "SMRA", companyName: "Summarecon Agung Tbk.", sector: "Properties & Real Estate", industry: "Township Property" },
  { symbol: "SRTG", companyName: "Saratoga Investama Sedaya Tbk.", sector: "Financials", industry: "Investment Holding" },
  { symbol: "SSMS", companyName: "Sawit Sumbermas Sarana Tbk.", sector: "Consumer Non-Cyclicals", industry: "Palm Oil Plantation" },
  { symbol: "TBIG", companyName: "Tower Bersama Infrastructure Tbk.", sector: "Infrastructures", industry: "Telecommunications Towers" },
  { symbol: "TINS", companyName: "Timah Tbk.", sector: "Basic Materials", industry: "Tin Mining" },
  { symbol: "TKIM", companyName: "Pabrik Kertas Tjiwi Kimia Tbk.", sector: "Basic Materials", industry: "Paper Products" },
  { symbol: "TLKM", companyName: "Telkom Indonesia (Persero) Tbk.", sector: "Telecommunication", industry: "Integrated Telecommunications" },
  { symbol: "TOWR", companyName: "Sarana Menara Nusantara Tbk.", sector: "Infrastructures", industry: "Telecommunications Towers" },
  { symbol: "TPIA", companyName: "Chandra Asri Pacific Tbk.", sector: "Basic Materials", industry: "Petrochemicals" },
  { symbol: "UNTR", companyName: "United Tractors Tbk.", sector: "Industrials", industry: "Heavy Machinery & Mining Contracting" },
  { symbol: "UNVR", companyName: "Unilever Indonesia Tbk.", sector: "Consumer Non-Cyclicals", industry: "Personal & Household Products" },
  { symbol: "WIKA", companyName: "Wijaya Karya (Persero) Tbk.", sector: "Infrastructures", industry: "Construction" },
  { symbol: "WSKT", companyName: "Waskita Karya (Persero) Tbk.", sector: "Infrastructures", industry: "Construction" }
];

async function main() {
  console.log("🌱 Memulai Seeding Basis Data...");

  // 1. Akun Pengguna Demo (Pemula & Berpengalaman)
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const demoUserBeginner = await prisma.user.upsert({
    where: { email: "fayiz.pemula@example.com" },
    update: {},
    create: {
      name: "Fayiz Akbar (Pemula)",
      email: "fayiz.pemula@example.com",
      passwordHash,
      investorProfile: "BEGINNER",
    },
  });

  const demoUserExperienced = await prisma.user.upsert({
    where: { email: "fayiz.expert@example.com" },
    update: {},
    create: {
      name: "Fayiz Akbar (Berpengalaman)",
      email: "fayiz.expert@example.com",
      passwordHash,
      investorProfile: "EXPERIENCED",
    },
  });

  console.log(`✅ Demo Users dibuat: ${demoUserBeginner.email}, ${demoUserExperienced.email}`);

  // 2. Seeding 80 Emiten Indeks IDX80
  console.log(`⏳ Seeding ${IDX80_STOCKS.length} Emiten Konstituen Indeks IDX80...`);
  for (const stock of IDX80_STOCKS) {
    await prisma.stock.upsert({
      where: { symbol: stock.symbol },
      update: {
        companyName: stock.companyName,
        sector: stock.sector,
        industry: stock.industry,
        isIdx80: true,
      },
      create: {
        symbol: stock.symbol,
        companyName: stock.companyName,
        sector: stock.sector,
        industry: stock.industry,
        exchange: "IDX",
        isIdx80: true,
      },
    });
  }
  console.log(`✅ ${IDX80_STOCKS.length} Saham IDX80 berhasil dimasukkan ke tabel 'stocks'.`);

  // 3. Watchlist Awal Demo
  await prisma.watchlist.upsert({
    where: {
      userId_symbol: {
        userId: demoUserBeginner.id,
        symbol: "BBCA",
      },
    },
    update: {},
    create: {
      userId: demoUserBeginner.id,
      symbol: "BBCA",
    },
  });

  console.log("✅ Watchlist demo berhasil dibuat.");
  console.log("🎉 Seeding Database Selesai!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
