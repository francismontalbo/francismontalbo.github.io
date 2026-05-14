// Extend Tailwind with our custom colour palette. These names can be used as classes
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              primary: '#FFFFFF',      // white primary surface
              primaryDark: '#F8FAFC',  // near-white secondary surface
              tertiary: '#EFF6FF',    // pale blue surface
              dark: '#FFFFFF',        // white base surface
              accent: '#2563EB',      // primary accent blue
              accent2: '#1D4ED8'      // deeper accent blue
            }
          }
        }
      };
