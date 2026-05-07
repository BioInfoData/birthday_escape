/**
 * Game Configuration
 * This file contains all the customizable text and logic for the game.
 * It attempts to load configuration from localStorage, passing back to defaults if not found.
 */

const DEFAULT_GAME_CONFIG = {
    "title": "הצופן הגנטי",
    "gameTitle": "בואו נפתור ביחד את הצופן הגנטי!!! מוכנות לאתגר?",
    "welcomeImage": "assets/img/custom_welcome.webp",
    "welcomeText": "",
    "finishTitle": "כל הכבוד!!! 🎉",
    "finishBody": "",
    "finalPrizeText": "כל הכבוד! \nפיצחתן את הצופן הגנטי!\nאתן מדעניות אמיתיות!!!",
    "finishFooter": "",
    "stages": [
        {
            "id": 1,
            "title": "קבוצה 1",
            "story": "",
            "image": "assets/img/custom_stage_1.jpeg",
            "correctCode": "עיניים בצבע כחול, שיער שחור, גובה מטר חמישים",
            "hints": []
        },
        {
            "id": 2,
            "title": "קבוצה 2",
            "story": "",
            "image": "assets/img/custom_stage_2.webp",
            "correctCode": "עיניים בצבע חום, שיער מתולתל, גובה מטר שישים",
            "hints": []
        },
        {
            "id": 3,
            "title": "קבוצה 3",
            "story": "",
            "image": "assets/img/custom_stage_3.png",
            "correctCode": "עיניים בצבע ירוק, שיער בלונדיני, גובה מטר חמישים",
            "hints": []
        },
        {
            "id": 4,
            "title": "קבוצה 4",
            "story": "",
            "image": "assets/img/custom_stage_4.jpeg",
            "correctCode": "עיניים בצבע חום, שיער חלק, גובה מטר חמישים",
            "hints": []
        },
        {
            "id": 5,
            "title": "קבוצה 5",
            "story": "",
            "image": "assets/img/custom_stage_5.jpeg",
            "correctCode": "עיניים בצבע ירוק, שיער חום, גובה מטר שישים",
            "hints": []
        },
        {
            "id": 6,
            "title": "קבוצה 6",
            "story": "",
            "image": "assets/img/custom_stage_6.jpeg",
            "correctCode": "עיניים בצבע כחול, שיער חלק, גובה מטר שישים",
            "hints": []
        }
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
