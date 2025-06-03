# 🚀 Vishal Zambre - Portfolio Website

A modern, responsive portfolio website showcasing 12+ years of experience in Software Architecture, Remote Team Leadership, Ruby on Rails, React.js, and DevOps.

[![Jekyll](https://img.shields.io/badge/Jekyll-4.x-red.svg)](https://jekyllrb.com/)
[![GitHub Pages](https://img.shields.io/badge/Deployed%20on-GitHub%20Pages-blue.svg)](https://pages.github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 Features

### 🎨 Modern Design
- **Responsive Design** - Works perfectly on all devices (mobile, tablet, desktop)
- **Modern UI/UX** - Clean, professional design inspired by best portfolio practices
- **Smooth Animations** - Subtle fade-in effects and hover animations
- **Typography** - Beautiful Inter font family for optimal readability

### 📱 Interactive Elements
- **Mobile Navigation** - Animated hamburger menu for mobile devices
- **Smooth Scrolling** - Seamless navigation between sections
- **Active Navigation** - Highlights current section in navigation
- **Contact Form** - Working contact form with validation
- **Skill Tags** - Interactive hover effects on technology tags

### 🛠 Technical Features
- **Jekyll Static Site** - Fast, secure, and SEO-friendly
- **SEO Optimized** - Meta tags, structured data, and sitemap
- **Performance Optimized** - Optimized CSS and JavaScript
- **Accessibility** - WCAG compliant with proper ARIA labels
- **Google Analytics** - Integrated tracking for insights

### 📊 Portfolio Sections
- **Hero Section** - Eye-catching introduction with key highlights
- **About Me** - Professional summary with experience statistics
- **Skills & Technologies** - Organized by categories (Backend, Frontend, DevOps, etc.)
- **Featured Projects** - Grouped by domain (E-Commerce, SaaS, Insurance, etc.)
- **Professional Experience** - Timeline of career progression
- **Contact Information** - Multiple ways to get in touch

## 🏗 Project Structure

```
vishalzambre.github.io/
├── _layouts/           # Jekyll layouts
│   └── portfolio.html  # Main portfolio layout
├── _includes/          # Reusable components
├── _posts/            # Blog posts
├── _data/             # Data files
├── assets/
│   ├── css/
│   │   └── portfolio.css  # Main stylesheet
│   └── js/
│       └── portfolio.js   # Interactive features
├── _config.yml        # Jekyll configuration
├── index.markdown     # Homepage content
├── about.markdown     # About page
├── contact.markdown   # Contact page
└── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites
- Ruby 2.7+
- Bundler gem
- Jekyll gem

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/vishalzambre/vishalzambre.github.io.git
   cd vishalzambre.github.io
   ```

2. **Install dependencies**
   ```bash
   bundle install
   ```

3. **Start the development server**
   ```bash
   bundle exec jekyll serve
   ```

4. **Open in browser**
   ```
   http://localhost:4000
   ```

### 🔧 Customization

#### Personal Information
Edit `_config.yml` to update:
- Name, email, and social links
- Job title and description
- Skills and technologies
- Contact information

#### Projects
Update the projects section in `index.markdown`:
- Add new projects with descriptions
- Update technology stacks
- Modify project domains and categories

#### Styling
Customize the design in `assets/css/portfolio.css`:
- Update color scheme in CSS variables
- Modify typography and spacing
- Adjust responsive breakpoints

#### Content
- **About Section**: Edit the about content in `index.markdown`
- **Skills**: Update the skills grid with your technologies
- **Experience**: Modify the timeline with your career progression

## 📱 Responsive Design

The portfolio is fully responsive and optimized for:
- **Mobile** (320px - 768px)
- **Tablet** (768px - 1024px)
- **Desktop** (1024px+)

Key responsive features:
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly navigation
- Optimized images and fonts

## 🔍 SEO Optimization

The site includes comprehensive SEO features:
- **Meta Tags** - Proper title, description, and keywords
- **Open Graph** - Social media sharing optimization
- **Structured Data** - Schema.org markup for search engines
- **Sitemap** - Automatic XML sitemap generation
- **Performance** - Fast loading times and optimized assets

## 🚀 Deployment

### GitHub Pages (Recommended)
1. Fork this repository
2. Rename to `yourusername.github.io`
3. Update `_config.yml` with your information
4. Push changes to main branch
5. Site will be available at `https://yourusername.github.io`

### Custom Domain
1. Add `CNAME` file with your domain
2. Configure DNS with your domain provider
3. Update `url` in `_config.yml`

### Alternative Hosting
The site can be deployed to:
- **Netlify** - Connect GitHub repo for automatic deployments
- **Vercel** - Import project and deploy
- **AWS S3** - Static website hosting
- **Any web server** - Upload `_site` folder contents

## 🛠 Development Commands

```bash
# Install dependencies
bundle install

# Start development server
bundle exec jekyll serve

# Build for production
bundle exec jekyll build

# Start with drafts
bundle exec jekyll serve --drafts

# Start with livereload
bundle exec jekyll serve --livereload

# Build and watch for changes
bundle exec jekyll build --watch
```

## 📋 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Internet Explorer 11+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- **Jekyll** - Static site generator
- **Inter Font** - Typography
- **Font Awesome** - Icons
- **GitHub Pages** - Hosting
- **Minakshi Portfolio** - Design inspiration

## 📞 Contact

**Vishal Zambre**
- Email: v.zambre@gmail.com
- LinkedIn: [vishalzambre](https://linkedin.com/in/vishalzambre)
- GitHub: [vishalzambre](https://github.com/vishalzambre)
- Twitter: [@vzambre](https://twitter.com/vzambre)

---

⭐ If you found this portfolio template helpful, please give it a star!

**Built with ❤️ using Jekyll and modern web technologies**
