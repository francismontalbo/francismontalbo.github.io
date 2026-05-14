// Extend Tailwind with our custom colour palette. These names can be used as classes
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              primary: '#1E40AF',      // royal blue (readable on white text)
              primaryDark: '#1E3A8A',  // deep navy-blue
              tertiary: '#1E293B',    // slate
              dark: '#0B1220',        // rich dark bg
              accent: '#2563EB',      // trusted blue
              accent2: '#60A5FA'      // light accent blue
            }
          }
        }
      };
