const fs = require('fs');

let c = fs.readFileSync('finalexam.html', 'utf8');

c = c.replace(/const savedDob = localStorage\.getItem\('tlj_dob'\);\r?\n/g, '');
c = c.replace(/if\(savedDob\) document\.getElementById\('dob'\)\.value = savedDob;\r?\n/g, '');
c = c.replace(/let autoDob = "";\r?\n/g, '');
c = c.replace(/const dobInput = document\.getElementById\('dob'\);\r?\n/g, '');
c = c.replace(/const dob = document\.getElementById\('dob'\)\.value;\r?\n/g, '');
c = c.replace(/if\(!name \|\| !place \|\| !mobile \|\| !dob\) return alert\("Please fill all fields, including Date of Birth\."\);/g, 'if(!name || !place || !mobile) return alert("Please fill all fields.");');
c = c.replace(/localStorage\.setItem\('tlj_dob', dob\);\r?\n/g, '');
c = c.replace(/studentData = \{ name, place, mobile, dob, approved: false \};/g, 'studentData = { name, place, mobile, approved: false };');
c = c.replace(/<div>\r?\n\s*<label class="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-2 mb-1">Date of Birth<\/label>\r?\n\s*<input type="date" id="dob" class="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:border-blue-400 transition-colors text-slate-500 uppercase">\r?\n\s*<\/div>/g, '');
c = c.replace(/<span class="text-\[10px\] text-slate-500 font-normal">DOB: \$\{d\.dob \? new Date\(d\.dob\)\.toLocaleDateString\(\) : 'N\/A'\}<\/span>/g, '');

fs.writeFileSync('finalexam.html', c, 'utf8');
console.log('Removed DOB');
