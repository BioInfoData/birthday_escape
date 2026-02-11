/**
 * Game Configuration
 * This file contains all the customizable text and logic for the game.
 * It attempts to load configuration from localStorage, passing back to defaults if not found.
 */

const DEFAULT_GAME_CONFIG = {
    // General
    title: "יום הולדת שמח!", // Browser Title
    gameTitle: "חדר בריחה - יום הולדת", // Main Heading

    // Welcome Page (index.html)
    welcomeImage: "assets/img/stage1.jpg",
    welcomeText: "שלום! מוכנים לצאת למרדף אחר האוצר האבוד? עליכם לפתור חידות ולהתקדם בשלבים.",

    // Final Page (finish.html)
    finishTitle: "כל הכבוד!!! 🎉",
    finishBody: "צלחתם את כל המכשולים, פתרתם את כל החידות והוכחתם שאתם אלופים אמיתיים!",
    finalPrizeText: "כל הכבוד! סיימתם את כל האתגרים! \nהפרס מחכה לכם בארון המטבח העליון 😉",
    finishFooter: "מקווים שנהניתם! יום הולדת שמח! 🥳",

    // Configuration for each stage
    stages: [
        {
            id: 1,
            title: "חידה 1: ההתחלה",
            story: "ברוכים הבאים! כדי להתחיל את המסע, עליכם למצוא את המספר המסתתר בתמונה.",
            image: "assets/img/stage1.jpg", // Fixed path to be relative to root if needed, or handled by page
            correctCode: "1234", // Simple numeric code
            hints: [
                "נסו לספור את הבלונים בתמונה...",
                "המספר הוא 1234 (סתם, זה דוגמה)"
            ]
        },
        {
            id: 2,
            title: "חידה 2: היער הקסום",
            story: "הגעתם ליער הקסום. פיה קטנה לוחשת לכם שאתם צריכים לפתור חידת חשבון פשוטה.",
            image: "assets/img/stage2.jpg",
            correctCode: "0505",
            hints: [
                "כמה אצבעות יש לכם ביד אחת?",
                "פעמיים חמש..."
            ]
        },
        {
            id: 3,
            title: "חידה 3: המפתח האבוד",
            story: "מפתח הזהב אבד בים. הצוללן צריך את הקוד לפתיחת התיבה.",
            image: "assets/img/stage3.jpg",
            correctCode: "777",
            hints: [
                "מספר המזל...",
                "שלוש פעמים שבע"
            ]
        },
    ]
};

// Logic to load config
let GAME_CONFIG = DEFAULT_GAME_CONFIG;

try {
    const savedConfig = localStorage.getItem('BIRTHDAY_GAME_CONFIG');
    if (savedConfig) {
        GAME_CONFIG = JSON.parse(savedConfig);
        // Basic validation or migration could go here
    }
} catch (e) {
    console.warn("Failed to load custom config", e);
}

// Prevent modification in browser console for safety (basic)
// Object.freeze(GAME_CONFIG); // Removed freeze to allow runtime updates if we wanted, but keeping it simple for now.
