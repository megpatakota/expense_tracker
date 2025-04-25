// site-style-config.js
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Brand colors
        primary: '#124559',         
        buttons: '#A4243B',        
        
        // Background colors
        bg_dark: '#124559',   
        bg_light: '#f3e7f6',    
        
        // Text colors
        text_primary: '#22223B',    // Dark slate blue - main headings
        text_secondary: '#68505B',  // Ocean blue - secondary headings/accents
        text_tertiary: '#4E6A51',   // Slate gray - body text
        text_button: '#EEF8FC',     // White - text on buttons
        
        // Dark mode versions
        dark_buttons: '#124559',    // Same blue for buttons in dark mode
        dark_text_primary: '#EEF8FC', // Off-white - dark mode headings
        dark_text_secondary: '#94A3B8', // Light blue-gray - dark mode secondary text
        dark_text_button: '#EEF8FC',   // White - dark mode button text
        
        // Utility
        header: '#EEF8FC',   
        header_text : '#004E52',
        
        // Animation colors - simplified to 4 playful colors
        animation: {
          color1: '#F5C6DE',       // Playful pink
          color2: '#C2E3F7',       // Playful blue
          color3: '#f3e7f6',       // Playful purple
          // color4: '#BAE7C0',       // Playful mint
        }
      },
    },
  }
};