// Extend Tailwind with our custom colour palette. These names can be used as classes
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              primary: '#111827',      // neutral near-black
              primaryDark: '#0B0B0B',  // deep black
              tertiary: '#1F2937',    // charcoal
              dark: '#000000',        // black
              accent: '#2563EB',      // minimal blue accent
              accent2: '#3B82F6'      // lighter blue accent
            }
          }
        }
      };
