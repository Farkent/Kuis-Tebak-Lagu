// Test Scoring Logic
console.log("=== TEBAK LAGU SCORING TEST ===\n");

// Scenario 1: 3 soal, 2 benar, 1 salah
const scenario1 = {
  totalSoal: 3,
  jawabanBenar: 2,
  jawabanSalah: 1
};

const scoreAkhir1 = scenario1.jawabanBenar; // 2
const akurasi1 = Math.round((scoreAkhir1 / scenario1.totalSoal) * 100); // (2/3)*100 = 66%

console.log("Scenario 1: 3 soal, 2 benar");
console.log(`  Score Akhir: ${scoreAkhir1}/${scenario1.totalSoal}`);
console.log(`  Akurasi: ${akurasi1}%\n`);

// Scenario 2: 5 soal, 4 benar, 1 salah
const scenario2 = {
  totalSoal: 5,
  jawabanBenar: 4,
  jawabanSalah: 1
};

const scoreAkhir2 = scenario2.jawabanBenar; // 4
const akurasi2 = Math.round((scoreAkhir2 / scenario2.totalSoal) * 100); // (4/5)*100 = 80%

console.log("Scenario 2: 5 soal, 4 benar");
console.log(`  Score Akhir: ${scoreAkhir2}/${scenario2.totalSoal}`);
console.log(`  Akurasi: ${akurasi2}%\n`);

// Scenario 3: 10 soal, semua benar
const scenario3 = {
  totalSoal: 10,
  jawabanBenar: 10,
  jawabanSalah: 0
};

const scoreAkhir3 = scenario3.jawabanBenar; // 10
const akurasi3 = Math.round((scoreAkhir3 / scenario3.totalSoal) * 100); // (10/10)*100 = 100%

console.log("Scenario 3: 10 soal, 10 benar");
console.log(`  Score Akhir: ${scoreAkhir3}/${scenario3.totalSoal}`);
console.log(`  Akurasi: ${akurasi3}%\n`);

// Scenario 4: 7 soal, 3 benar, 4 salah
const scenario4 = {
  totalSoal: 7,
  jawabanBenar: 3,
  jawabanSalah: 4
};

const scoreAkhir4 = scenario4.jawabanBenar; // 3
const akurasi4 = Math.round((scoreAkhir4 / scenario4.totalSoal) * 100); // (3/7)*100 ≈ 43%

console.log("Scenario 4: 7 soal, 3 benar");
console.log(`  Score Akhir: ${scoreAkhir4}/${scenario4.totalSoal}`);
console.log(`  Akurasi: ${akurasi4}%\n`);

console.log("=== FORMULA YANG BENAR ===");
console.log("Score Akhir = Jumlah jawaban BENAR");
console.log("Akurasi % = Math.round((Score Akhir / Total Soal) * 100)");
