---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: portfolio
title: "About Me"
description: "Software Architect | Remote Team Lead | React Rails Engineer | DevOps | Fullstack Developer with 12+ years of experience"
sitemap:
  priority: 1.0
---

<!-- Hero Section -->
{% assign today = site.time | date: '%Y' %}
{% assign start = site.joning-date | date: '%Y'  %}
{% assign since = today | minus: start %}
{% assign react_exp = since | minus: 6 %}
<section class="hero">
    <div class="hero-container">
        <div class="hero-content">
            <div class="hero-text">
                <h1>Hi, I'm <span class="highlight">{{ site.title }}</span></h1>
                <h2>{{ site.designation }}</h2>
                <p>With over <strong>{{since}}+ years of experience</strong> in designing, developing, and deploying high-performance web applications. Proficient in Ruby on Rails, RESTful APIs, React, and modern DevOps technologies. Passionate about clean code, TDD/BDD practices, and leveraging AI tools to enhance development productivity.</p>

                <div class="hero-buttons">
                    <a href="#projects" class="btn btn-primary">View My Work</a>
                    <a href="#contact" class="btn btn-secondary">Get In Touch</a>
                </div>
            </div>

            <div class="hero-image">
                <div class="profile-card">
                    <div class="profile-avatar">
                        <i class="fas fa-user-tie"></i>
                    </div>
                    <div class="profile-info">
                        <h3>{{ site.title }}</h3>
                        <p>Senior Software Engineer</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- About Section -->
<section id="about" class="about">
    <div class="container">
        <div class="section-header">
            <h2>About Me</h2>
            <p>Building robust, scalable solutions with passion and precision</p>
        </div>

        <div class="about-content">
            <div class="about-text">
                <p>I'm a passionate Ruby on Rails developer with over <strong>12+ years of experience</strong> in designing, developing, and deploying high-performance web applications. I specialize in creating scalable solutions using Ruby on Rails, RESTful APIs, PostgreSQL, React, and modern DevOps technologies.</p>

                <p>I'm adept at writing clean, efficient code and implementing TDD and BDD practices. My expertise includes system performance optimization, third-party API integration, team leadership, and leveraging AI tools like GitHub Copilot to enhance development productivity.</p>

                <p>As an <strong>OSS Contributor</strong> to Rails and Spree, I actively contribute to the open-source community and maintain several popular plugins.</p>
            </div>

            <div class="about-stats">
                <div class="stat-item">
                    <div class="stat-number">12+</div>
                    <div class="stat-label">Years Experience</div>
                </div>

                <div class="stat-item">
                    <div class="stat-number">MCA</div>
                    <div class="stat-label">Engineering Degree</div>
                </div>

                <div class="stat-item">
                    <div class="stat-number">50+</div>
                    <div class="stat-label">Projects Completed</div>
                </div>

                <div class="stat-item">
                    <div class="stat-number">10+</div>
                    <div class="stat-label">Open Source Contributions</div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Skills Section -->
<section id="skills" class="skills">
    <div class="container">
        <div class="section-header">
            <h2>Skills & Technologies</h2>
            <p>My technical expertise spans across full-stack development and DevOps</p>
        </div>

        <div class="skills-grid">
            <div class="skill-category">
                <h3><i class="fas fa-server"></i> Backend & Languages</h3>
                <div class="skill-tags">
                    <span class="skill-tag">Ruby</span>
                    <span class="skill-tag">Ruby on Rails</span>
                    <span class="skill-tag">RESTful APIs</span>
                    <span class="skill-tag">JBuilder</span>
                    <span class="skill-tag">Serializers</span>
                    <span class="skill-tag">Rails Engines</span>
                    <span class="skill-tag">Sinatra</span>
                    <span class="skill-tag">Spree</span>
                </div>
            </div>

            <div class="skill-category">
                <h3><i class="fas fa-laptop-code"></i> Frontend Technologies</h3>
                <div class="skill-tags">
                    <span class="skill-tag">JavaScript</span>
                    <span class="skill-tag">React</span>
                    <span class="skill-tag">AngularJS</span>
                    <span class="skill-tag">HTML5</span>
                    <span class="skill-tag">CSS3</span>
                    <span class="skill-tag">jQuery</span>
                    <span class="skill-tag">HAML</span>
                    <span class="skill-tag">SASS</span>
                </div>
            </div>

            <div class="skill-category">
                <h3><i class="fas fa-database"></i> Databases & Storage</h3>
                <div class="skill-tags">
                    <span class="skill-tag">PostgreSQL</span>
                    <span class="skill-tag">MySQL</span>
                    <span class="skill-tag">Redis</span>
                    <span class="skill-tag">Elasticsearch</span>
                    <span class="skill-tag">Snowflake</span>
                    <span class="skill-tag">AWS S3</span>
                </div>
            </div>

            <div class="skill-category">
                <h3><i class="fas fa-cloud"></i> DevOps & Deployment</h3>
                <div class="skill-tags">
                    <span class="skill-tag">AWS EC2</span>
                    <span class="skill-tag">Docker</span>
                    <span class="skill-tag">Kubernetes</span>
                    <span class="skill-tag">Nginx</span>
                    <span class="skill-tag">Unicorn</span>
                    <span class="skill-tag">Passenger</span>
                    <span class="skill-tag">Ansible</span>
                    <span class="skill-tag">Capistrano</span>
                    <span class="skill-tag">Heroku</span>
                    <span class="skill-tag">Rancher</span>
                </div>
            </div>

            <div class="skill-category">
                <h3><i class="fas fa-vial"></i> Testing & Development</h3>
                <div class="skill-tags">
                    <span class="skill-tag">RSpec</span>
                    <span class="skill-tag">Cucumber</span>
                    <span class="skill-tag">TDD/BDD</span>
                    <span class="skill-tag">Sidekiq</span>
                    <span class="skill-tag">ActiveAdmin</span>
                    <span class="skill-tag">GitHub Actions</span>
                    <span class="skill-tag">Jenkins</span>
                    <span class="skill-tag">Circle CI</span>
                </div>
            </div>

            <div class="skill-category">
                <h3><i class="fas fa-robot"></i> AI Tools & Integration</h3>
                <div class="skill-tags">
                    <span class="skill-tag">GitHub Copilot</span>
                    <span class="skill-tag">ChatGPT</span>
                    <span class="skill-tag">PayPal API</span>
                    <span class="skill-tag">Stripe</span>
                    <span class="skill-tag">Twilio</span>
                    <span class="skill-tag">Mandrill</span>
                    <span class="skill-tag">OAuth</span>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Projects Section -->
<section id="projects" class="projects">
    <div class="container">
        <div class="section-header">
            <h2>Featured Projects</h2>
            <p>Showcasing my expertise across different domains</p>
        </div>

        <!-- E-Commerce & Marketplace Projects -->
        <div class="project-domain">
            <h3 class="domain-title"><i class="fas fa-shopping-cart"></i> E-Commerce & Marketplace</h3>

            <div class="projects-grid">
                <div class="project-card">
                    <div class="project-header">
                        <h4>Custom Apparel E-Commerce Platform</h4>
                        <span class="project-period">May 2024 - Present</span>
                    </div>
                    <p>Built custom T-shirt creation and e-commerce platforms with design tools, payment integration, and order management systems. Implemented Redis for caching and Sidekiq for background processing.</p>
                    <div class="project-tech">
                        <span class="tech-tag">Ruby 3.3</span>
                        <span class="tech-tag">Rails 7.0</span>
                        <span class="tech-tag">React</span>
                        <span class="tech-tag">PostgreSQL</span>
                        <span class="tech-tag">AWS</span>
                        <span class="tech-tag">Sidekiq</span>
                        <span class="tech-tag">Python</span>
                        <span class="tech-tag">Kubernetes</span>
                    </div>
                    <div class="project-role">Role: Senior Software Engineer</div>
                </div>

                <div class="project-card">
                    <div class="project-header">
                        <h4>Amazon Marketplace Integration</h4>
                        <span class="project-period">2017 - 2020</span>
                    </div>
                    <p>Marketplace platform for ads and campaigns at Amazon, working across different countries with comprehensive data analytics and campaign management.</p>
                    <div class="project-tech">
                        <span class="tech-tag">Ruby 3.0</span>
                        <span class="tech-tag">Rails 7.0</span>
                        <span class="tech-tag">React</span>
                        <span class="tech-tag">PostgreSQL</span>
                        <span class="tech-tag">Snowflake</span>
                    </div>
                    <div class="project-role">Role: Software Architect with Team Lead</div>
                </div>

                <div class="project-card">
                    <div class="project-header">
                        <h4>Hosting Platform</h4>
                        <span class="project-period">May 2017 - 2022</span>
                    </div>
                    <p>Leading hosting provider platform in South Africa with comprehensive digital services including domain management, hosting solutions, and integrated marketing tools.</p>
                    <div class="project-tech">
                        <span class="tech-tag">Ruby 3.0</span>
                        <span class="tech-tag">Rails 7.0</span>
                        <span class="tech-tag">React</span>
                        <span class="tech-tag">PostgreSQL</span>
                        <span class="tech-tag">AWS</span>
                        <span class="tech-tag">Kubernetes</span>
                    </div>
                    <div class="project-role">Role: Remote Team Lead | Software Architect</div>
                </div>

                <div class="project-card">
                    <div class="project-header">
                        <h4>Amazon Marketplace Integration</h4>
                        <span class="project-period">2017 - 2020</span>
                    </div>
                    <p>Marketplace platform for ads and campaigns at Amazon, working across different countries with comprehensive data analytics and campaign management.</p>
                    <div class="project-tech">
                        <span class="tech-tag">Ruby 3.0</span>
                        <span class="tech-tag">Rails 7.0</span>
                        <span class="tech-tag">React</span>
                        <span class="tech-tag">PostgreSQL</span>
                        <span class="tech-tag">Snowflake</span>
                    </div>
                    <div class="project-role">Role: Software Architect with Team Lead</div>
                </div>

                <div class="project-card">
                    <div class="project-header">
                        <h4>E-Commerce Platform</h4>
                        <span class="project-period">2013 - 2015</span>
                    </div>
                    <p>E-commerce platform for flower bouquet and cake delivery in UAE and Qatar with comprehensive order management and payment integration.</p>
                    <div class="project-tech">
                        <span class="tech-tag">Ruby 2.2.5</span>
                        <span class="tech-tag">Rails 4.2</span>
                        <span class="tech-tag">PostgreSQL</span>
                        <span class="tech-tag">Paypal</span>
                        <span class="tech-tag">Heroku</span>
                    </div>
                    <div class="project-role">Role: Lead Backend Developer</div>
                </div>
            </div>
        </div>

        <!-- SaaS & Enterprise Solutions -->
        <div class="project-domain">
            <h3 class="domain-title"><i class="fas fa-building"></i> SaaS & Enterprise Solutions</h3>

            <div class="projects-grid">
                <div class="project-card">
                    <div class="project-header">
                        <h4>DataMapper Cloud Platform</h4>
                        <span class="project-period">Jun 2014 - May 2017</span>
                    </div>
                    <p>Combination of Rails & Java for managing user portals, billing, surveys, and aerial data processing. Cloud-based application for drone data management.</p>
                    <div class="project-tech">
                        <span class="tech-tag">Ruby 1.9.3</span>
                        <span class="tech-tag">Rails 3.2.17</span>
                        <span class="tech-tag">Java</span>
                        <span class="tech-tag">MySQL 5.5</span>
                        <span class="tech-tag">AWS SDK</span>
                    </div>
                    <div class="project-role">Role: Developer</div>
                </div>

                <div class="project-card">
                    <div class="project-header">
                        <h4>Review Platform</h4>
                        <span class="project-period">2015 - 2017</span>
                    </div>
                    <p>Review collection platform working across Shopify, Ecwid, Squarespace, and WooCommerce with advanced analytics and customer feedback management.</p>
                    <div class="project-tech">
                        <span class="tech-tag">Ruby 2.6.1</span>
                        <span class="tech-tag">Rails 5.2</span>
                        <span class="tech-tag">PostgreSQL</span>
                        <span class="tech-tag">Shopify API</span>
                        <span class="tech-tag">Heroku</span>
                    </div>
                    <div class="project-role">Role: Team Lead</div>
                </div>

                <div class="project-card">
                    <div class="project-header">
                        <h4>Health Management</h4>
                        <span class="project-period">2016 - 2018</span>
                    </div>
                    <p>Health domain project for managing Gym ERP with detailed user reports, attendance tracking, and employee management for mobile and web platforms.</p>
                    <div class="project-tech">
                        <span class="tech-tag">Ruby 2.3.1</span>
                        <span class="tech-tag">Rails 5.0.0.1</span>
                        <span class="tech-tag">PostgreSQL 9.5</span>
                        <span class="tech-tag">React</span>
                        <span class="tech-tag">AWS</span>
                    </div>
                    <div class="project-role">Role: Tech Lead</div>
                </div>
            </div>
        </div>

        <!-- Insurance & Financial -->
        <div class="project-domain">
            <h3 class="domain-title"><i class="fas fa-shield-alt"></i> Insurance & Financial</h3>

            <div class="projects-grid">
                <div class="project-card">
                    <div class="project-header">
                        <h4>Property Insurance Platform</h4>
                        <span class="project-period">2018 - 2020</span>
                    </div>
                    <p>Big insurance platform in the US dealing with renter insurance, integrated with different Property Management Systems (PMS) for comprehensive coverage.</p>
                    <div class="project-tech">
                        <span class="tech-tag">Ruby 3.0</span>
                        <span class="tech-tag">Rails 7.0.1</span>
                        <span class="tech-tag">PostgreSQL</span>
                        <span class="tech-tag">React</span>
                        <span class="tech-tag">Heroku</span>
                    </div>
                    <div class="project-role">Role: Pod Lead</div>
                </div>
            </div>
        </div>

        <!-- Mobile & Content Services -->
        <div class="project-domain">
            <h3 class="domain-title"><i class="fas fa-mobile-alt"></i> Mobile & Content Services</h3>

            <div class="projects-grid">
                <div class="project-card">
                    <div class="project-header">
                        <h4>Value Added Services Platform</h4>
                        <span class="project-period">2014 - 2016</span>
                    </div>
                    <p>Content and mobile payment platform through mobile recharge and postpaid bills with comprehensive business rules and client management across 3 sections.</p>
                    <div class="project-tech">
                        <span class="tech-tag">Ruby 3.0</span>
                        <span class="tech-tag">Rails 7.0.1</span>
                        <span class="tech-tag">MySQL</span>
                        <span class="tech-tag">JavaScript</span>
                        <span class="tech-tag">Nginx</span>
                    </div>
                    <div class="project-role">Role: Technical Lead Architect</div>
                </div>

                <div class="project-card">
                    <div class="project-header">
                        <h4>Mobile Content Delivery</h4>
                        <span class="project-period">2013 - 2015</span>
                    </div>
                    <p>Value Added Services Domain project for mobile payments and content delivery across Europe & UK with multi-country payment gateway integration.</p>
                    <div class="project-tech">
                        <span class="tech-tag">Ruby 2.4.4</span>
                        <span class="tech-tag">Rails 4.2</span>
                        <span class="tech-tag">MySQL</span>
                        <span class="tech-tag">Payment Gateways</span>
                        <span class="tech-tag">Nginx</span>
                    </div>
                    <div class="project-role">Role: Lead Developer</div>
                </div>
            </div>
        </div>

        <!-- Tourism & Travel -->
        <div class="project-domain">
            <h3 class="domain-title"><i class="fas fa-plane"></i> Tourism & Travel</h3>

            <div class="projects-grid">
                <div class="project-card">
                    <div class="project-header">
                        <h4>Tourism Service</h4>
                        <span class="project-period">2015 - 2017</span>
                    </div>
                    <p>Epitome of Inbound Tourism in UAE from Russia, leading Commonwealth of Independent States (CIS) market with comprehensive booking and management system.</p>
                    <div class="project-tech">
                        <span class="tech-tag">Ruby 2.2.1</span>
                        <span class="tech-tag">Rails 4.2.1</span>
                        <span class="tech-tag">PostgreSQL 9.4</span>
                        <span class="tech-tag">React</span>
                        <span class="tech-tag">AWS</span>
                    </div>
                    <div class="project-role">Role: Tech Lead</div>
                </div>
            </div>
        </div>

        <!-- Custom Solutions -->
        <div class="project-domain">
            <h3 class="domain-title"><i class="fas fa-cogs"></i> Custom Solutions</h3>

            <div class="projects-grid">
                <div class="project-card">
                    <div class="project-header">
                        <h4>Fabrily Custom T-Shirt Platform</h4>
                        <span class="project-period">2014 - 2017</span>
                    </div>
                    <p>Platform for creating custom T-shirts with no costs or hassle, handling payment, printing, shipping, and profit distribution with live deployments and code reviews.</p>
                    <div class="project-tech">
                        <span class="tech-tag">Ruby 1.9.3</span>
                        <span class="tech-tag">Rails 3.2.17</span>
                        <span class="tech-tag">MySQL 5.5</span>
                        <span class="tech-tag">Redis</span>
                        <span class="tech-tag">Sidekiq</span>
                    </div>
                    <div class="project-role">Role: Acting Tech Lead</div>
                </div>

                <div class="project-card">
                    <div class="project-header">
                        <h4>Teespring Custom Apparel</h4>
                        <span class="project-period">2016 - 2017</span>
                    </div>
                    <p>Similar to Fabrily, enabling creation and sale of custom apparel with zero upfront costs and zero risk, managing the complete supply chain.</p>
                    <div class="project-tech">
                        <span class="tech-tag">Ruby 2.2.1</span>
                        <span class="tech-tag">Rails 4.2</span>
                        <span class="tech-tag">MySQL 5.6</span>
                        <span class="tech-tag">Rspec</span>
                        <span class="tech-tag">AWS</span>
                    </div>
                    <div class="project-role">Role: Lead Developer</div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Experience Timeline Section -->
<section id="experience" class="experience">
    <div class="container">
        <div class="section-header">
            <h2>Professional Experience</h2>
            <p>My journey through different roles and technologies</p>
        </div>

        <div class="timeline">
            <div class="timeline-item">
                <div class="timeline-date">May 2017 - Present</div>
                <div class="timeline-content">
                    <h3>Remote Team Lead | Software Architect | React Rails Engineer | DevOps</h3>
                    <h4>Freelance</h4>
                    <p>Leading remote teams and architecting scalable solutions for hosting providers, marketplaces, and enterprise applications. Managing technical decisions, code reviews, and deployment strategies.</p>
                    <ul>
                        <li>Led development of hosting platform serving South African market</li>
                        <li>Architected Amazon marketplace integration handling multi-country campaigns</li>
                        <li>Implemented modern DevOps practices with Docker, Kubernetes, and CI/CD</li>
                        <li>Mentored teams across different time zones and cultures</li>
                    </ul>
                </div>
            </div>

            <div class="timeline-item">
                <div class="timeline-date">Jun 2014 - May 2017</div>
                <div class="timeline-content">
                    <h3>Senior Software Engineer</h3>
                    <h4>Weboniselab pvt ltd</h4>
                    <p>Developed complex applications ranging from drone data management platforms to custom e-commerce solutions, focusing on scalability and performance optimization.</p>
                    <ul>
                        <li>Built DataMapper cloud platform for aerial data processing</li>
                        <li>Developed Fabrily custom apparel platform with zero-risk business model</li>
                        <li>Implemented comprehensive testing strategies with RSpec and Cucumber</li>
                        <li>Worked with diverse tech stack including Ruby, Rails, Java, and cloud services</li>
                    </ul>
                </div>
            </div>

            <div class="timeline-item">
                <div class="timeline-date">Nov 2012 - Jun 2014</div>
                <div class="timeline-content">
                    <h3>Software Engineer</h3>
                    <h4>Anchanto Services Pvt Ltd Pune</h4>
                    <p>Started my professional journey building e-commerce applications and learning enterprise-level development practices in a dynamic startup environment.</p>
                    <ul>
                        <li>Developed MyLifeInc e-commerce platform for Singapore market</li>
                        <li>Built Ship.li platform for SME online retail solutions</li>
                        <li>Gained expertise in payment gateway integrations and third-party APIs</li>
                        <li>Contributed to architectural decisions and deployment strategies</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Contact Section -->
<section id="contact" class="contact">
    <div class="container">
        <div class="section-header">
            <h2>Get In Touch</h2>
            <p>Let's work together on your next project</p>
        </div>

        <div class="contact-content">
            <div class="contact-info">
                <h3>Let's Work Together</h3>
                <p>I'm always open to discussing new opportunities, interesting projects, or just having a chat about Ruby on Rails, React, DevOps, technology, and development best practices.</p>

                <div class="contact-details">
                    <div class="contact-item">
                        <i class="fas fa-envelope"></i>
                        <div>
                            <strong>Email</strong>
                            <p>{{ site.email }}</p>
                        </div>
                    </div>

                    <div class="contact-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <div>
                            <strong>Location</strong>
                            <p>India (Remote Work Available)</p>
                        </div>
                    </div>

                    <div class="contact-item">
                        <i class="fas fa-clock"></i>
                        <div>
                            <strong>Response Time</strong>
                            <p>Within 24 hours</p>
                        </div>
                    </div>
                </div>

                <div class="contact-social">
                    {% if site.github_username %}
                    <a href="https://github.com/{{ site.github_username }}" target="_blank" aria-label="GitHub">
                        <i class="fab fa-github"></i>
                    </a>
                    {% endif %}
                    {% if site.linkedin_username %}
                    <a href="https://linkedin.com/in/{{ site.linkedin_username }}" target="_blank" aria-label="LinkedIn">
                        <i class="fab fa-linkedin"></i>
                    </a>
                    {% endif %}
                    {% if site.twitter_username %}
                    <a href="https://twitter.com/{{ site.twitter_username }}" target="_blank" aria-label="Twitter">
                        <i class="fab fa-twitter"></i>
                    </a>
                    {% endif %}
                </div>
            </div>

            <div class="contact-form">
                <form action="https://formspree.io/f/{{ site.email }}" method="POST" class="contact-form-element">
                    <div class="form-group">
                        <input type="text" name="name" placeholder="Your Name" required>
                    </div>

                    <div class="form-group">
                        <input type="email" name="email" placeholder="Your Email" required>
                    </div>

                    <div class="form-group">
                        <input type="text" name="subject" placeholder="Subject" required>
                    </div>

                    <div class="form-group">
                        <textarea name="message" placeholder="Your Message" rows="5" required></textarea>
                    </div>

                    <button type="submit" class="btn btn-primary">
                        <span>Send Message</span>
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </form>
            </div>
        </div>
    </div>
</section>
