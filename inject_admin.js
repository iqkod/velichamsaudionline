const fs = require('fs');
let html = fs.readFileSync('finalexam.html', 'utf-8');

// 1. Update score calculation in submitQuiz
html = html.replace(
    /const score = selections\.filter\(\(s, i\) => questions\[i\] && s === questions\[i\]\.correct\)\.length;/g,
    `const score = selections.reduce((acc, s, i) => {
                    if (questions[i] && s === questions[i].correct) {
                        return acc + (Number(questions[i].marks) || 1);
                    }
                    return acc;
                }, 0);`
);

// 2. Update student max score
html = html.replace(
    /document\.getElementById\('student-score-display'\)\.innerText = \`\$\{docData\.score\}\/\$\{questions\.length\}\`;/g,
    `const maxScore = questions.reduce((acc, q) => acc + (Number(q.marks) || 1), 0);
                    document.getElementById('student-score-display').innerText = \\\`\\\${docData.score}/\\\${maxScore}\\\`;`
);

// 3. Update admin table score
html = html.replace(
    /<td class="p-3 font-bold text-blue-600">\$\{d\.score\}\/\$\{questions\.length\}<\/td>/g,
    `<td class="p-3 font-bold text-blue-600">\${d.score}/\${questions.reduce((acc, q) => acc + (Number(q.marks) || 1), 0)}</td>`
);

// 4. Update uploadQuestions mapping to include marks
html = html.replace(
    /newQuestions\.push\(\{\s*q: String\(r\[1\] \|\| ""\),\s*a: String\(r\[2\] \|\| ""\),\s*b: String\(r\[3\] \|\| ""\),\s*c: String\(r\[4\] \|\| ""\),\s*d: String\(r\[5\] \|\| ""\),\s*correct: correctRaw\s*\}\);/g,
    `let marks = 1;
                    if (r[7] !== undefined && r[7] !== null && String(r[7]).trim() !== "") {
                        let parsedMark = Number(r[7]);
                        if (!isNaN(parsedMark) && parsedMark > 0) marks = parsedMark;
                    }

                    newQuestions.push({
                        q: String(r[1] || ""),
                        a: String(r[2] || ""),
                        b: String(r[3] || ""),
                        c: String(r[4] || ""),
                        d: String(r[5] || ""),
                        correct: correctRaw,
                        marks: marks
                    });`
);

// 5. Update template to include marks column
html = html.replace(
    /\["No", "Question", "Option A", "Option B", "Option C", "Option D", "Correct Answer \(a, b, c, or d\)"\],/g,
    `["No", "Question", "Option A", "Option B", "Option C", "Option D", "Correct Answer (a, b, c, or d)", "Marks (Optional)"],`
);

// 6. Update allowAnyMobile in startQuiz
const authCheckRegex = /\/\/ Fetch Authorized Mobiles from DB[\s\S]*?if\(\!ALLOWED_MOBILES\.includes\(mobile\)\) \{[\s\S]*?return alert\("ഈ മൊബൈൽ നമ്പറിന് പ്രവേശനമില്ല[^"]*"\);\s*\}/;
const newAuthCheck = `
            // Fetch Authorized Mobiles and Settings from DB
            let allowAny = false;
            try {
                const settingsSnap = await getDoc(controlDocRef);
                if (settingsSnap.exists() && settingsSnap.data().allowAnyMobile) {
                    allowAny = true;
                }

                const mobilesSnap = await getDoc(doc(db, "quiz_control", "allowed_mobiles"));
                if (mobilesSnap.exists() && mobilesSnap.data().mobiles?.length > 0) {
                    ALLOWED_MOBILES = mobilesSnap.data().mobiles;
                }
            } catch (err) {
                console.error("Error fetching rules", err);
            }

            if (allowAny) {
                const mobileRegex = /^\\d{1,4}-\\d{5,15}$/;
                if (!mobileRegex.test(mobile)) {
                    return alert("ദയവായി ശരിയായ ഫോർമാറ്റിൽ മൊബൈൽ നമ്പർ നൽകുക. ഉദാഹരണം: CountryCode-MobileNumber (eg: 966-501234567)");
                }
            } else {
                if(!ALLOWED_MOBILES.includes(mobile)) {
                    return alert("ഈ മൊബൈൽ നമ്പറിന് പ്രവേശനമില്ല. ദയവായി ലിസ്റ്റിലുള്ള ഫോർമാറ്റിൽ തന്നെ നമ്പർ നൽകുക (ഉദാഹരണം: 91-7034253576).");
                }
            }
`;
html = html.replace(authCheckRegex, newAuthCheck.trim());

// 7. Admin Editor Logic & Toggle Logic (JS)
const adminEditorJS = `
        let adminEditingQuestions = [];

        window.openQuestionEditor = async () => {
            document.getElementById('admin-screen').classList.add('hidden');
            document.getElementById('admin-editor-screen').classList.remove('hidden');
            adminEditingQuestions = [...questions];
            renderAdminEditor();
        };

        window.renderAdminEditor = () => {
            const container = document.getElementById('admin-editor-list');
            container.innerHTML = '';
            adminEditingQuestions.forEach((q, i) => {
                const div = document.createElement('div');
                div.className = "bg-white p-4 rounded-xl border border-blue-100 shadow-sm mb-4 relative text-left";
                div.innerHTML = \`
                    <button onclick="deleteAdminQuestion(\${i})" class="absolute top-2 right-2 text-red-500 font-bold hover:text-red-700 text-xs tracking-widest flex items-center gap-1 bg-red-50 px-2 py-1 rounded"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg> DEL</button>
                    <div class="flex flex-col gap-3 mt-4">
                        <div>
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">ചോദ്യം \${i+1}</label>
                            <textarea id="edit-q-\${i}" class="w-full text-sm p-3 border border-slate-200 rounded-lg outline-none focus:border-blue-400 font-bold text-slate-700 leading-relaxed" rows="2">\${q.q}</textarea>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label class="text-[9px] font-bold text-blue-500 uppercase tracking-widest pl-1">Option A</label>
                                <input type="text" id="edit-a-\${i}" value="\${q.a}" placeholder="Option A text" class="w-full text-xs p-3 font-bold border border-slate-200 rounded-lg outline-none focus:border-blue-400">
                            </div>
                            <div>
                                <label class="text-[9px] font-bold text-blue-500 uppercase tracking-widest pl-1">Option B</label>
                                <input type="text" id="edit-b-\${i}" value="\${q.b}" placeholder="Option B text" class="w-full text-xs p-3 font-bold border border-slate-200 rounded-lg outline-none focus:border-blue-400">
                            </div>
                            <div>
                                <label class="text-[9px] font-bold text-blue-500 uppercase tracking-widest pl-1">Option C</label>
                                <input type="text" id="edit-c-\${i}" value="\${q.c}" placeholder="Option C text" class="w-full text-xs p-3 font-bold border border-slate-200 rounded-lg outline-none focus:border-blue-400">
                            </div>
                            <div>
                                <label class="text-[9px] font-bold text-blue-500 uppercase tracking-widest pl-1">Option D</label>
                                <input type="text" id="edit-d-\${i}" value="\${q.d}" placeholder="Option D text" class="w-full text-xs p-3 font-bold border border-slate-200 rounded-lg outline-none focus:border-blue-400">
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3 pb-2">
                            <div>
                                <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Correct (a/b/c/d)</label>
                                <input type="text" id="edit-correct-\${i}" value="\${q.correct}" placeholder="a, b, c, or d" class="w-full text-xs p-3 font-black text-emerald-600 border border-slate-200 rounded-lg outline-none focus:border-emerald-400 uppercase text-center bg-emerald-50">
                            </div>
                            <div>
                                <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Marks (Def: 1)</label>
                                <input type="number" id="edit-marks-\${i}" value="\${q.marks || 1}" placeholder="1" class="w-full text-xs p-3 font-black text-blue-600 border border-slate-200 rounded-lg outline-none focus:border-blue-400 text-center bg-blue-50">
                            </div>
                        </div>
                    </div>
                \`;
                container.appendChild(div);
            });
        };

        window.deleteAdminQuestion = (idx) => {
            if(confirm('ഈ ചോദ്യം ഡിലീറ്റ് ചെയ്യണോ?')) {
                adminEditingQuestions.splice(idx, 1);
                renderAdminEditor();
            }
        };

        window.addAdminQuestion = () => {
            adminEditingQuestions.push({ q: "", a: "", b: "", c: "", d: "", correct: "a", marks: 1 });
            renderAdminEditor();
            const container = document.getElementById('admin-editor-list');
            setTimeout(() => { container.scrollTop = container.scrollHeight; }, 100);
        };

        window.saveAdminQuestions = async () => {
            const btn = document.getElementById('save-editor-btn');
            btn.disabled = true;
            btn.innerText = "Saving...";
            
            let newQ = [];
            for (let i = 0; i < adminEditingQuestions.length; i++) {
                const qText = document.getElementById(\`edit-q-\${i}\`).value.trim();
                const aText = document.getElementById(\`edit-a-\${i}\`).value.trim();
                const bText = document.getElementById(\`edit-b-\${i}\`).value.trim();
                const cText = document.getElementById(\`edit-c-\${i}\`).value.trim();
                const dText = document.getElementById(\`edit-d-\${i}\`).value.trim();
                const correctRaw = document.getElementById(\`edit-correct-\${i}\`).value.toLowerCase().trim();
                const marksRaw = document.getElementById(\`edit-marks-\${i}\`).value;
                
                if (!['a','b','c','d'].includes(correctRaw)) {
                    alert(\`ചോദ്യം \${i+1} ന്റെ ശരിയായ ഉത്തരം തെറ്റാണ്. a, b, c, or d നൽകുക.\`);
                    btn.disabled = false;
                    btn.innerText = "SAVE CHANGES";
                    return;
                }
                
                let marks = 1;
                let parsedMark = Number(marksRaw);
                if (!isNaN(parsedMark) && parsedMark > 0) marks = parsedMark;

                newQ.push({ q: qText, a: aText, b: bText, c: cText, d: dText, correct: correctRaw, marks: marks });
            }
            
            try {
                await setDoc(doc(db, "quiz_questions", "default"), { questions: newQ });
                questions = newQ; // update local
                alert("ചോദ്യങ്ങൾ വിജയകരമായി സേവ് ചെയ്തു.");
                closeAdminEditor();
            } catch(e) {
                console.error(e);
                alert("സേവ് ചെയ്യുന്നതിൽ പിശക്!");
            } finally {
                btn.disabled = false;
                btn.innerText = "SAVE CHANGES";
            }
        };

        window.closeAdminEditor = () => {
            document.getElementById('admin-editor-screen').classList.add('hidden');
            document.getElementById('admin-screen').classList.remove('hidden');
        };

        window.updateAllowAnyUI = (isAllowed) => {
            const toggleBtn = document.getElementById('allow-any-toggle');
            if(toggleBtn) {
                if(isAllowed) {
                    toggleBtn.innerText = "ANY MOBILE: ON";
                    toggleBtn.className = "bg-green-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold shadow-sm hover:bg-green-700 transition-colors uppercase";
                    toggleBtn.dataset.status = "on";
                } else {
                    toggleBtn.innerText = "ANY MOBILE: OFF";
                    toggleBtn.className = "bg-slate-400 text-white px-4 py-2 rounded-xl text-[10px] font-bold shadow-sm transition-colors hover:bg-slate-500 uppercase";
                    toggleBtn.dataset.status = "off";
                }
            }
        }

        window.toggleAllowAnyMobile = async () => {
            const btn = document.getElementById('allow-any-toggle');
            const newStatus = btn.dataset.status !== "on";
            if (confirm(\`Are you sure you want to \${newStatus ? 'ALLOW ANY MOBILE NUMBER' : 'RESTRICT TO AUTHORIZED NUMBERS'}?\`)) {
                await setDoc(controlDocRef, { allowAnyMobile: newStatus }, { merge: true });
                updateAllowAnyUI(newStatus);
            }
        };
`;
html = html.replace('// ADMIN LOGIC', adminEditorJS + '\n        // ADMIN LOGIC');

// 8. Add updateAllowAnyUI logic to loadExamStatus
html = html.replace(
    /if \(data\.durationMinutes\) \{/g,
    `if (data.allowAnyMobile !== undefined) updateAllowAnyUI(data.allowAnyMobile);
                    if (data.durationMinutes) {`
);

// 9. Add Editor UI HTML next to finish-screen
const adminEditorHTML = `
            <div id="admin-editor-screen" class="hidden h-[80vh] flex flex-col">
                <div class="flex justify-between items-center mb-6 shrink-0">
                    <div>
                        <h2 class="font-bold text-blue-900 text-xl tracking-tight">ചോദ്യങ്ങൾ തിരുത്തുക</h2>
                        <p class="text-[10px] text-slate-400 uppercase tracking-widest font-bold">MANUAL QUESTION EDITOR</p>
                    </div>
                    <button onclick="closeAdminEditor()" class="text-slate-400 hover:text-slate-600 font-bold uppercase text-[10px] tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors">X Close</button>
                </div>

                <div id="admin-editor-list" class="flex-1 space-y-4 overflow-y-auto pr-2 mb-6 p-2 bg-slate-50 border border-slate-100 rounded-2xl shadow-inner scroll-smooth">
                    <!-- Editor items go here -->
                </div>

                <div class="flex gap-4 shrink-0">
                    <button onclick="addAdminQuestion()" class="w-1/3 border-2 border-dashed border-blue-400 text-blue-600 p-4 rounded-2xl font-bold bg-blue-50/50 hover:bg-blue-100 transition-colors uppercase tracking-widest text-xs">+ ADD</button>
                    <button id="save-editor-btn" onclick="saveAdminQuestions()" class="w-2/3 bg-emerald-600 text-white p-4 rounded-2xl font-bold tracking-widest uppercase hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 text-xs">SAVE CHANGES</button>
                </div>
            </div>
`;
html = html.replace(/<div id="finish-screen"/, adminEditorHTML + '\n            <div id="finish-screen"');

// 10. Add EXAM ALLOW ANY MOBILE TOGGLE and EDIT QUESTIONS BUTTON in UI
const examStatusRegex = /<button id="exam-status-btn" onclick="toggleExamStatus\(\)" class="bg-gray-400 text-white px-4 py-2 rounded-xl text-\[10px\] font-bold shadow-sm transition-colors" data-status="loading">LOADING\.\.\.<\/button>/;
const newAdminButtons = `
                    <button id="exam-status-btn" onclick="toggleExamStatus()" class="bg-gray-400 text-white px-4 py-2 rounded-xl text-[10px] font-bold shadow-sm transition-colors" data-status="loading">LOADING...</button>
                    <button id="allow-any-toggle" onclick="toggleAllowAnyMobile()" class="bg-gray-400 text-white px-4 py-2 rounded-xl text-[10px] font-bold shadow-sm transition-colors" data-status="off">ANY MOBILE: OFF</button>
                    <button onclick="openQuestionEditor()" class="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold shadow-sm hover:bg-indigo-700 transition-colors uppercase tracking-wider">EDIT QUESTIONS</button>
`;
html = html.replace(examStatusRegex, newAdminButtons);

fs.writeFileSync('finalexam_injected.html', html, 'utf-8');
console.log('Script injection complete.');
