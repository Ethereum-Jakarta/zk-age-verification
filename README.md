# 🆔 ZK Age Verification

A privacy-preserving age verification system using Zero-Knowledge proofs with Indonesian KTP (ID card) data. Built with React, TypeScript, and Circom circuits, deployed on Monad blockchain.

![ZK Age Verification](https://img.shields.io/badge/ZK-Age%20Verification-purple)
![React](https://img.shields.io/badge/React-18.x-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Circom](https://img.shields.io/badge/Circom-2.0-green)
![Wagmi](https://img.shields.io/badge/Wagmi-2.x-orange)

## 🌟 Features

- **🔒 Zero-Knowledge Privacy**: Prove you're over 18 without revealing your birth date
- **🇮🇩 KTP Integration**: Designed for Indonesian ID card data format (DD-MM-YYYY)
- **⚡ Real-time Proof Generation**: Instant ZK proof creation in the browser
- **🔗 Blockchain Verification**: On-chain verification using Groth16 proofs on Monad testnet
- **🎨 Modern UI**: Beautiful, responsive interface with Tailwind CSS
- **🛡️ Graceful Fallbacks**: Demo mode with mock proofs when circuits unavailable

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   ZK Circuit    │    │   Blockchain    │
│   (React)       │    │   (Circom)      │    │   (Monad)       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • KTP Input     │───▶│ • Age Check     │───▶│ • Proof Verify  │
│ • UI/UX         │    │ • Commitment    │    │ • Smart Contract│
│ • Wallet Connect│    │ • Privacy       │    │ • Public Record │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Git
- MetaMask or compatible Web3 wallet

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/zk-age-verification.git
cd zk-age-verification

# Install dependencies
npm install

# Copy circuit files to public directory
chmod +x copy-circuit-files.sh
./copy-circuit-files.sh

# Start development server
npm run dev
```

### Environment Setup

1. **Copy environment variables:**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure your `.env.local`:**
   ```env
   VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
   VITE_MONAD_RPC_URL=https://testnet-rpc.monad.xyz
   ```

3. **Get WalletConnect Project ID:**
   - Visit [WalletConnect Cloud](https://cloud.walletconnect.com)
   - Create a new project
   - Copy the Project ID to your `.env.local`

## 📁 Project Structure

```
zk-age-verification/
├── public/
│   └── circuits/              # ZK circuit files (copied from build)
│       └── build/
│           ├── ageVerification_js/
│           │   └── ageVerification.wasm
│           ├── ageVerification_0001.zkey
│           └── verification_key.json
├── src/
│   ├── components/            # React components
│   │   ├── Header.tsx
│   │   ├── KTPInputForm.tsx
│   │   ├── ZKProofDisplay.tsx
│   │   └── CircuitStatus.tsx
│   ├── hooks/                 # Custom React hooks
│   │   └── useSnarkjsStatus.ts
│   ├── lib/                   # Core libraries
│   │   ├── zkProof.ts         # ZK proof generation
│   │   └── snarkjsLoader.ts   # SnarkJS management
│   ├── config/                # Configuration
│   │   └── chains.ts          # Blockchain configs
│   ├── types/                 # TypeScript types
│   │   └── ktp.ts
│   └── constants/             # Smart contract ABIs
├── circuits/                  # Circom source files
│   ├── build/                 # Generated circuit files
│   └── ageVerification.circom # Circuit source
└── scripts/
    └── copy-circuit-files.sh  # Setup script
```

## 🔧 Development

### Running the Application

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Type checking
npm run type-check
```

### Building ZK Circuits

If you need to rebuild the circuits:

```bash
# Install circom (if not already installed)
npm install -g circom

# Compile circuit
circom circuits/ageVerification.circom --r1cs --wasm --sym

# Generate proving key (requires ceremony - simplified for demo)
# This step typically requires a trusted setup ceremony
```

## 🛠️ How It Works

### 1. **KTP Data Input**
User enters their Indonesian KTP birth date in DD-MM-YYYY format:
- Day: 1-31
- Month: 1-12  
- Year: 1900-2010 (circuit constraint)

### 2. **ZK Proof Generation**
```typescript
// Circuit inputs (private)
const privateInputs = {
  birthDay: 25,
  birthMonth: 1, 
  birthYear: 1995,
  salt: randomSalt    // For privacy
};

// Public inputs
const publicInputs = {
  currentYear: 2025,
  currentMonth: 6,
  currentDay: 28
};

// Generates proof that age >= 18 without revealing birth date
const proof = await zkGenerator.generateAgeProof(inputs);
```

### 3. **Blockchain Verification**
```solidity
// Smart contract verifies the proof
function verifyAge(
    uint[2] memory _pA,
    uint[2][2] memory _pB, 
    uint[2] memory _pC,
    uint[2] memory _publicSignals
) public returns (bool) {
    // Groth16 verification
    return verifier.verifyProof(_pA, _pB, _pC, _publicSignals);
}
```

## 📱 Usage Guide

### Step 1: Connect Wallet
- Click "Connect Wallet" 
- Choose your preferred wallet (MetaMask recommended)
- Switch to Monad Testnet if prompted

### Step 2: Enter KTP Data
- Input your birth date in DD-MM-YYYY format
- Example: `25-01-1995`
- The system validates format and constraints

### Step 3: Generate ZK Proof
- Click "Generate ZK Proof"
- Wait for proof generation (usually 2-5 seconds)
- Review the proof details

### Step 4: Verify On-Chain
- Click "Verify on Blockchain"
- Confirm the transaction in your wallet
- Wait for confirmation

### Step 5: Success!
- View your verification on Monad Explorer
- Your age is proven without revealing birth date

## 🔒 Privacy & Security

### What's Private:
- ✅ Exact birth date
- ✅ Personal information
- ✅ Random salt used in commitment

### What's Public:
- ✅ Proof that you're over 18 (boolean)
- ✅ Cryptographic commitment hash
- ✅ Verification transaction

### Security Features:
- **Field Element Constraints**: Salt values bounded to prevent overflow
- **Range Validation**: Birth date components validated (day: 1-31, month: 1-12, year: 1900-2010)
- **Commitment Scheme**: Birth data hashed with random salt for privacy
- **Groth16 Proofs**: Industry-standard zero-knowledge proof system

## 🌐 Blockchain Integration

### Monad Testnet Configuration:
```typescript
export const monadTestnet = {
  id: 41454,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { 
      name: 'Monad Explorer', 
      url: 'https://testnet.monadexplorer.com' 
    },
  },
}
```

### Smart Contract:
- **Address**: `0x123...` (update with deployed address)
- **Network**: Monad Testnet
- **Verification**: Groth16 proof verification
- **Gas**: ~100k gas per verification

## 🧪 Testing

### Manual Testing:
1. **Valid Adult Birth Date**: `25-01-1990` → Should generate proof with `isAdult = 1`
2. **Valid Minor Birth Date**: `25-01-2010` → Should generate proof with `isAdult = 0`
3. **Invalid Format**: `1990-01-25` → Should show validation error
4. **Out of Range**: `25-01-1850` → Should show constraint error

### Test Data:
```typescript
// Test cases
const testCases = [
  { input: "25-01-1990", expected: true },   // Adult
  { input: "25-01-2010", expected: false },  // Minor  
  { input: "15-06-1985", expected: true },   // Adult
  { input: "01-12-2008", expected: false },  // Minor
];
```

## 🚨 Troubleshooting

### Common Issues:

#### 1. "Circuit files not found"
```bash
# Solution: Copy circuit files
./copy-circuit-files.sh
```

#### 2. "SnarkJS not loaded"
```bash
# Check browser console for network errors
# Try refreshing the page
# Verify internet connection
```

#### 3. "Assert Failed. Error in template"
```bash
# Check birth year is between 1900-2010
# Verify date format is DD-MM-YYYY
# Ensure salt is within field constraints
```

#### 4. Wallet connection issues:
- Ensure MetaMask is installed
- Check you're on Monad Testnet
- Try refreshing and reconnecting

#### 5. Transaction failures:
- Check wallet has enough MON tokens
- Verify gas limits
- Try increasing gas price

### Debug Mode:

```bash
# Enable debug logging
localStorage.setItem('DEBUG', 'zkproof:*')

# Check circuit status
console.log(await ZKProofGenerator.isSupported())

# Verify file paths
fetch('/circuits/build/ageVerification_js/ageVerification.wasm')
```

## 🛣️ Roadmap

### Phase 1: Core Features ✅
- [x] Basic ZK proof generation
- [x] KTP date format support
- [x] Monad blockchain integration
- [x] Modern UI/UX

### Phase 2: Enhanced Privacy 🚧
- [ ] Poseidon hash for commitments
- [ ] Enhanced salt generation
- [ ] Multiple circuit versions
- [ ] Batch verification

### Phase 3: Production Ready 📋
- [ ] Mainnet deployment
- [ ] Circuit ceremony
- [ ] Security audit
- [ ] Performance optimization

### Phase 4: Advanced Features 🔮
- [ ] Multi-chain support
- [ ] Mobile app
- [ ] API integration
- [ ] Enterprise features

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### Setup Development Environment:
```bash
# Fork the repository
git clone https://github.com/yourusername/zk-age-verification.git

# Create feature branch
git checkout -b feature/your-feature-name

# Install dependencies
npm install

# Make your changes
# ...

# Run tests
npm run lint
npm run type-check

# Commit and push
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name

# Create Pull Request
```

### Code Style:
- Use TypeScript for type safety
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation

### Areas for Contribution:
- 🔒 **Security**: Audit circuits and smart contracts
- ⚡ **Performance**: Optimize proof generation
- 🎨 **UI/UX**: Improve user experience
- 📱 **Mobile**: Mobile-first responsive design
- 🌍 **Internationalization**: Support more languages
- 📚 **Documentation**: Improve guides and tutorials

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Circom**: Zero-knowledge circuit compiler
- **SnarkJS**: JavaScript library for zk-SNARKs
- **Monad**: High-performance blockchain platform
- **Wagmi**: React hooks for Ethereum
- **RainbowKit**: Wallet connection library
- **Tailwind CSS**: Utility-first CSS framework

## 📞 Support

- **Documentation**: [Read the docs](https://github.com/yourusername/zk-age-verification/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/zk-age-verification/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/zk-age-verification/discussions)
- **Email**: support@zkageverification.com

## 🔗 Links

- **Live Demo**: [https://zkageverification.vercel.app](https://zkageverification.vercel.app)
- **Monad Explorer**: [https://testnet.monadexplorer.com](https://testnet.monadexplorer.com)
- **Circuit Repository**: [https://github.com/yourusername/zk-circuits](https://github.com/yourusername/zk-circuits)

---

**Built with ❤️ for privacy-preserving identity verification**

*Last updated: December 2024*