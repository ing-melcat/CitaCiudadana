import fs from 'fs';

let content = fs.readFileSync('src/pages/MainApp.tsx', 'utf8');

const imports = `import { ScheduleScreen } from '../components/screens/ScheduleScreen';\n`;
if (!content.includes('import { ScheduleScreen }')) {
  content = content.replace(/import { IntroScreens }/, `${imports}import { IntroScreens }`);
}

// Replace the screen 11 block with the component
content = content.replace(
  /\{\/\*  AGENDAR  \*\/\}\n\s*\{screen === 11 && \([\s\S]*?CONFIRMAR CITA\n\s*<\/motion\.button>\n\s*<\/motion\.div>\n\n\s*<nav className="bottom-nav">[\s\S]*?<\/nav>\n\s*<\/section>\n\s*\)\}/,
  `{/*  AGENDAR  */}\n    {screen === 11 && (\n      <ScheduleScreen \n        setIsMenuOpen={setIsMenuOpen}\n        setScreen={setScreen}\n        handleLoadProfile={handleLoadProfile}\n        symptoms={symptoms}\n        setSymptoms={setSymptoms}\n        suggestedSpecialty={suggestedSpecialty}\n        setSearchQuery={setSearchQuery}\n        selectedDate={selectedDate}\n        setSelectedDate={setSelectedDate}\n        saveAppointment={saveAppointment}\n        userName={profileData?.name || 'Usuario'}\n      />\n    )}`
);

fs.writeFileSync('src/pages/MainApp.tsx', content);
console.log('MainApp.tsx patched with ScheduleScreen');
