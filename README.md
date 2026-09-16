# 🛒 Kedai-POS: Smart Point of Sale System

> *Empowering Small Businesses with Technology*

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-222222?style=for-the-badge&logo=github&logoColor=white)
![Responsive](https://img.shields.io/badge/Responsive-Yes-2f7d62?style=for-the-badge)

---

## 📖 Overview

**Kedai-POS** is a modern, web-based Point of Sale (POS) system designed specifically for small businesses and MSMEs (Micro, Small, and Medium Enterprises) in Southeast Asia. This project simplifies sales management, inventory tracking, and business operations through an intuitive, user-friendly interface—no complex setup required, no monthly fees, just effective business management.

Whether you're running a café, retail shop, restaurant, salon, or any small business, Kedai-POS provides real-time sales tracking, inventory synchronization, and comprehensive reporting to help you grow with confidence.

> ⚠️ **Note:** This project combines modern web development practices with practical business solutions, emphasizing accessibility and ease of use for entrepreneurs without technical backgrounds.

---

## ✨ Core Features

### 💼 Sales Management
| Feature | Description |
| :--- | :--- |
| 🧾 **Transaction Processing** | Fast, accurate point-of-sale transactions with multiple payment methods |
| 🏪 **Multi-Outlet Support** | Manage sales across multiple store locations in real-time |
| 💰 **Payment Methods** | Support for cash, card, digital wallets, and split billing |
| 📊 **Sales Dashboard** | Real-time sales overview with visual analytics |
| 🧾 **Receipt Management** | Digital and print receipt handling with Bluetooth printer support |

### 📦 Inventory Management
| Feature | Description |
| :--- | :--- |
| 📋 **Product Catalog** | Centralized product database with categories and pricing |
| 📉 **Stock Tracking** | Real-time inventory levels with low-stock alerts |
| 🔄 **Stock Synchronization** | Automatic inventory sync across multiple outlets |
| 📍 **Barcode Support** | Quick product lookup and inventory management via barcodes |
| ⚠️ **Stock Alerts** | Automatic notifications when items are running low |

### 👥 Customer Management
| Feature | Description |
| :--- | :--- |
| 👤 **Customer Database** | Maintain customer profiles and purchase history |
| 💳 **Loyalty Program Ready** | Framework for implementing loyalty and rewards programs |
| 📞 **Customer Contact** | Manage customer information for marketing and follow-ups |
| 💵 **Receivables Tracking** | Monitor customer credits and outstanding payments |
| 🎯 **Purchase History** | Access detailed customer transaction records |

### 📈 Reporting & Analytics
| Feature | Description |
| :--- | :--- |
| 📊 **Daily Reports** | End-of-day sales summaries and reconciliation |
| 📈 **Monthly Analytics** | Comprehensive monthly sales and performance metrics |
| 📥 **Export Capabilities** | Download reports in PDF and Excel formats |
| 💹 **Sales Trends** | Visual representation of sales patterns and growth |
| 📉 **Inventory Reports** | Stock movement and product performance analysis |

### ⚙️ System Features
| Feature | Description |
| :--- | :--- |
| 🔒 **PIN Security** | Business data protection with PIN lock functionality |
| 🌐 **Offline Mode** | Full functionality even without internet connection |
| 📱 **Responsive Design** | Seamless experience on desktop, tablet, and mobile devices |
| ⚡ **Fast & Lightweight** | Optimized for quick transactions and smooth performance |
| 🎨 **Intuitive UI** | User-friendly interface requiring no technical training |

---

## 🎨 Design Highlights

- **Color Palette:** Professional business colors with focus on usability
- **Typography:** Clean, readable fonts optimized for point-of-sale environments
- **Responsive Layout:** Fully optimized for POS terminals, tablets, and modern browsers
- **User Experience:** Designed for speed and minimal training requirements
- **Accessibility:** Easy navigation for users with varying technical expertise
- **Performance:** Optimized for offline operation and quick response times

---

## 🧩 File Structure

```bash
├── index.html              # Main dashboard/home page
├── sales.html              # Sales transaction page
├── inventory.html          # Inventory management
├── customers.html          # Customer management
├── reports.html            # Reports and analytics
├── products.html           # Product catalog management
├── settings.html           # System settings and configuration
├── css/
│   └── style.css           # Main stylesheet
├── js/
│   ├── app.js              # Main application logic
│   ├── pos-system.js       # POS transaction engine
│   ├── inventory.js        # Inventory management logic
│   ├── customers.js        # Customer database logic
│   ├── reports.js          # Reporting and analytics
│   └── utils.js            # Utility functions
├── data/                   # Local data storage schemas
├── assets/
│   ├── icons/              # UI icons
│   ├── images/             # Brand assets
│   └── logo.png            # Kedai-POS logo
├── offline/                # Offline mode support files
└── README.md               # Project documentation
```

---

## 🚀 Live Demo

🌐 **View the system:** [https://amzarmukminn.github.io/kedai-pos/](https://amzarmukminn.github.io/kedai-pos/)

### Quick Start Demo Credentials
| Role | Username | Password |
| :--- | :--- | :--- |
| Admin | `admin` | `admin123` |
| User | `cashier` | `cashier123` |

---

## 🛠️ Technologies Used

| Technology | Purpose |
| :--- | :--- |
| **HTML5** | Semantic structure and accessibility |
| **CSS3** | Responsive design and styling |
| **Vanilla JavaScript** | No framework dependencies - pure, performant logic |
| **LocalStorage API** | Client-side persistent data storage (offline support) |
| **IndexedDB** | Enhanced local database for large datasets |
| **Print API** | Receipt printing via network and Bluetooth printers |
| **Chart.js** | Data visualization and analytics |
| **Font Awesome** | Professional icon library |

---

## 📱 Responsive Breakpoints

| Device | Breakpoint | Optimization |
| :--- | :--- | :--- |
| Desktop (Full) | `1366px+` | Multi-panel dashboard, detailed reports |
| Tablet/iPad | `820px` | Optimized touch interface, stacked panels |
| Mobile (Phone) | `600px` | Single-column layout, large touch targets |
| Small Mobile | `400px` | Minimalist interface, essential features only |

---

## 🎯 Target Users

✅ **Cafés & Restaurants** - Manage dine-in orders, kitchen routing, table management  
✅ **Retail Shops** - Product catalog, barcode scanning, inventory sync  
✅ **Salons & Workshops** - Service-based transactions, appointment tracking  
✅ **Food Stalls & Kiosks** - Quick transactions, minimal setup  
✅ **Pop-up Vendors** - Mobile-friendly, offline-capable operations  
✅ **Multi-outlet Chains** - Centralized management across locations  

---

## 🚀 Getting Started

### Prerequisites
- Any modern web browser (Chrome, Firefox, Edge, Safari)
- No server setup or installation required
- Works offline with automatic sync

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/amzarmukminn/kedai-pos.git
   ```

2. **Navigate to project directory**
   ```bash
   cd kedai-pos
   ```

3. **Open in browser** (two options)
   ```bash
   # Option A: Direct open
   open index.html

   # Option B: Using VS Code Live Server
   code index.html
   # Then right-click and select "Open with Live Server"
   ```

4. **Login with demo credentials**
   - Username: `admin`
   - Password: `admin123`

### First-Time Setup
- Create admin account
- Add your products/items
- Configure basic settings
- Start processing transactions!

---

## 💡 Key Advantages

| Advantage | Benefit |
| :--- | :--- |
| **Zero Setup Cost** | No installation, no monthly subscription fees |
| **No Internet Required** | Full offline operation with local data storage |
| **Easy to Learn** | Intuitive interface, minimal training needed |
| **Multi-Outlet Ready** | Manage multiple stores from one system |
| **Export Reports** | PDF/Excel exports for accounting and analysis |
| **Data Security** | PIN-protected business data |
| **Mobile-Friendly** | Works on tablets, phones, and computers |
| **Fast Transactions** | Optimized for busy retail environments |

---

## 🔄 System Architecture

```
┌──────────────────────────────────────┐
│      Presentation Layer              │
│   (HTML5 + CSS3 + Responsive)        │
└──────────────────┬───────────────────┘
                   │
┌──────────────────▼───────────────────┐
│     Application Layer                │
│  (Vanilla JavaScript Modules)        │
│  • Sales Engine                      │
│  • Inventory Manager                 │
│  • Customer Service                  │
│  • Report Generator                  │
│  • Authentication System             │
└──────────────────┬───────────────────┘
                   │
┌──────────────────▼───────────────────┐
│      Data Layer                      │
│  (localStorage + IndexedDB)          │
│  • transactions[]                    │
│  • products[]                        │
│  • customers[]                       │
│  • inventory[]                       │
└──────────────────────────────────────┘
```

---

## 📊 Core Algorithms & Logic

### Transaction Processing
- Real-time item addition and total calculation
- Automatic tax computation
- Multi-payment method support
- Change calculation with rounding

### Inventory Management
- Live stock tracking across outlets
- Conflict detection (stock availability verification)
- Automatic low-stock alerts
- Stock movement history logging

### Reporting Engine
- Daily sales summary generation
- Period-based analytics
- Product performance ranking
- Customer spending analysis
- Export to PDF/Excel formats

---

## 🔒 Security Features

✅ **PIN-Based Authentication** - Protect access to business data  
✅ **Role-Based Access Control** - Admin vs. Cashier permissions  
✅ **Transaction Logging** - Audit trail for all operations  
✅ **Local Data Encryption** - Sensitive information protection  
✅ **Session Management** - Automatic timeout for security  

---

## 🔮 Future Roadmap

| Phase | Features |
| :--- | :--- |
| **Phase 1 (Current)** | Core POS, inventory, customers, basic reports |
| **Phase 2** | Payment gateway integration, QR code ordering |
| **Phase 3** | Cloud sync, multi-user collaboration |
| **Phase 4** | Mobile native app (PWA), SMS/WhatsApp notifications |
| **Phase 5** | AI-powered analytics, predictive inventory |
| **Phase 6** | API marketplace, third-party integrations |

---

## 📈 Feature Development Tracker

- [x] Sales transaction interface
- [x] Product inventory management
- [x] Customer database
- [x] Basic reporting
- [x] Offline functionality
- [ ] Payment gateway integration
- [ ] QR code menu ordering
- [ ] WhatsApp integration
- [ ] Cloud backup & sync
- [ ] Mobile app (PWA)
- [ ] Advanced analytics
- [ ] Staff management

---

## 🎓 Project Context

| Detail | Information |
| :--- | :--- |
| **Type** | Capstone/Self-Learning Project |
| **Scope** | Full-stack POS system for small businesses |
| **Technologies** | HTML5, CSS3, JavaScript (Vanilla) |
| **Key Challenge** | Building enterprise-grade offline functionality |
| **Learning Focus** | State management, local storage optimization, UX for non-technical users |

---

## 🤝 Contributing

Contributions, bug reports, and feature suggestions are welcome! Feel free to:
- Open an issue for bugs
- Suggest new features
- Submit pull requests
- Provide feedback

---

## 📧 Contact & Support

**Developer:** Muhammad Amzar Mukmin Bin Pauzan  
**Email:** amzarmukmin10@gmail.com  
**GitHub:** [@amzarmukminn](https://github.com/amzarmukminn)  
**Portfolio:** [Visit Profile](https://github.com/amzarmukminn)

---

## 📝 Documentation

### Getting Started Guide
See [GETTING_STARTED.md](./docs/GETTING_STARTED.md) for detailed setup instructions.

### User Manual
See [USER_MANUAL.md](./docs/USER_MANUAL.md) for feature walkthroughs.

### Developer Guide
See [DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md) for API documentation.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Target Businesses** - For inspiring practical business solutions
- **Community** - For feedback and feature requests
- **Open Source** - For libraries, icons, and tools used
- **Every Small Business Owner** - Your entrepreneurial spirit drives innovation

---

## 🔗 Quick Links

[![GitHub Repository](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/amzarmukminn/kedai-pos)
[![Live Demo](https://img.shields.io/badge/Live_Demo-00D26A?style=for-the-badge&logo=github&logoColor=white)](https://amzarmukminn.github.io/kedai-pos/)
[![Report Issue](https://img.shields.io/badge/Report_Issue-FF0000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/amzarmukminn/kedai-pos/issues)

---

## 💡 Tips for Success

📌 **For Store Owners:**
- Start with basic product setup
- Train cashiers on the system gradually
- Use reports to understand peak hours
- Backup data regularly

📌 **For Developers:**
- Extend the system with custom modules
- Integrate payment gateways
- Add loyalty program features
- Build mobile app wrapper

---

<p align="center">
  <strong>Kedai-POS: Empowering Small Businesses with Technology</strong><br>
  <i>Built with ❤️ for entrepreneurs and small business owners</i><br>
  <i>Made for efficiency. Made for growth. Made for you.</i> 🚀
</p>

---

<sub>Last Updated: September 2026 | Version 1.0 | © Amzar Mukmin</sub>
