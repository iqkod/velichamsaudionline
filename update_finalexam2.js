const fs = require('fs');

const tljPath = 'c:\\\\Code\\\\TheLightJuniors\\\\grandfinale.html';
const destPath = 'c:\\\\Code\\\\velichamsaudionline\\\\finalexam.html';

let content = fs.readFileSync(tljPath, 'utf8');

// Replace Firebase Config Block
const oldConfig = `        const firebaseConfig = {
            apiKey: "AIzaSyCi-CtVFqpD4nczjeNfuLbTwMz_DJh99Sg",
            authDomain: "thelightjuniors.firebaseapp.com",
            projectId: "thelightjuniors",
            storageBucket: "thelightjuniors.firebasestorage.app",
            messagingSenderId: "961257050705",
            appId: "1:961257050705:web:2914677489b0c488979e70"
        };`;
        
const newConfig = `        const firebaseConfig = {
            apiKey: "AIzaSyBPHM4eHRhRPyA-JFDXMrbuFIeMvnGByts",
            authDomain: "velichamsaudionline-66fc0.firebaseapp.com",
            projectId: "velichamsaudionline-66fc0",
            storageBucket: "velichamsaudionline-66fc0.firebasestorage.app",
            messagingSenderId: "414471469839",
            appId: "1:414471469839:web:d4ad0bd9d8c31dfe85dc7a"
        };`;

content = content.replace(oldConfig, newConfig);

// Replace appId for the collections
content = content.replace('const appId = "thelightjuniors";', 'const appId = "vso_finalexam";');

// Title and Text adjustments
content = content.replace('<title>The Light Juniors - Quiz Portal</title>', '<title>വെളിച്ചം റമദാൻ 2026 (VR2026) - Final Exam</title>');
content = content.replace('BACK TO HOME', 'velichamsaudionline.com');
content = content.replace('href="https://www.thelightjuniors.com/"', 'href="https://velichamsaudionline.com/"');
content = content.replace('<h1 class="text-4xl font-black text-slate-800 tracking-tight mb-2 uppercase italic">Portal</h1>', '<h1 class="text-3xl font-black text-slate-800 tracking-tight mb-2 uppercase italic">വെളിച്ചം റമദാൻ 2026<br>Final Exam</h1>');

// Replace Excel Filenames
content = content.replace(/TLJ_Authorized_Mobiles_Template\.xlsx/g, 'VR2026_Authorized_Mobiles_Template.xlsx');
content = content.replace(/TLJ_Question_Template\.xlsx/g, 'VR2026_Question_Template.xlsx');
content = content.replace(/TLJ_Quiz_Results\.xlsx/g, 'VR2026_FinalExam_Results.xlsx');

fs.writeFileSync(destPath, content, 'utf8');
console.log('Successfully updated finalexam.html to match TheLightJuniors features while keeping Firebase VSO config.');
