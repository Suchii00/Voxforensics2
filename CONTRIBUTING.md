# Contributing to VoxForensics

Thank you for your interest in contributing to VoxForensics! This document provides guidelines and information for contributors.

---

## 🎯 How to Contribute

### Reporting Bugs

1. Check existing issues first
2. Create a new issue with:
   - Clear title
   - Detailed description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser and OS information

### Suggesting Features

1. Open an issue with the "enhancement" label
2. Describe the feature and its benefits
3. Provide examples or mockups if possible
4. Discuss implementation ideas

### Submitting Code

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 💻 Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Setup Steps

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/voxforensics.git
cd voxforensics

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test
```

---

## 📝 Code Style Guidelines

### TypeScript

- Use TypeScript for all new files
- Define proper types and interfaces
- Avoid `any` type when possible
- Use meaningful variable names

### React

- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Follow React best practices

### CSS/Tailwind

- Use Tailwind utility classes
- Follow the existing design system
- Maintain responsive design
- Use CSS variables for theming

### Comments

- Add JSDoc comments for functions
- Explain complex algorithms
- Document non-obvious code
- Keep comments up-to-date

---

## 🧪 Testing

### Before Submitting

1. **Run E2E Tests**: Click "🧪 E2E Tests" in the app
2. **Test with Real Audio**: Upload various audio files
3. **Test Edge Cases**: Empty files, large files, invalid formats
4. **Check Responsive Design**: Test on mobile and desktop
5. **Verify Security Scanner**: Upload different file types

### Test Coverage

- AI detection accuracy
- Security scanner validation
- Consent flow
- File upload handling
- Recording functionality
- PDF generation
- History management

---

## 🔄 Pull Request Process

### 1. Create Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 2. Make Changes

- Follow code style guidelines
- Add tests if applicable
- Update documentation
- Keep commits atomic

### 3. Commit Messages

Use conventional commit format:

```
feat: add new feature
fix: resolve bug
docs: update documentation
style: format code
refactor: restructure code
test: add tests
chore: update dependencies
```

### 4. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub with:
- Clear title
- Description of changes
- Related issue numbers
- Screenshots if UI changes

### 5. Code Review

- Respond to feedback
- Make requested changes
- Update PR as needed
- Wait for approval

---

## 🎨 Design Guidelines

### Colors

- Primary: #00F2FE (Cyan)
- Secondary: #7F00FF (Purple)
- Background: #030712 (Dark)
- Success: #00FF88 (Green)
- Error: #FF0055 (Red)

### Typography

- Font: Inter
- Headings: Bold, large
- Body: Regular, readable
- Code: Monospace

### Components

- Use glassmorphic cards
- Neon button effects
- Smooth animations
- Responsive layouts

---

## 📚 Documentation

### Code Documentation

- Add JSDoc comments
- Document public APIs
- Explain algorithms
- Include examples

### User Documentation

- Update README if needed
- Add inline help text
- Create usage examples
- Document new features

---

## 🐛 Debugging Tips

### Common Issues

1. **Audio not processing**: Check browser console for errors
2. **3D background not rendering**: Verify WebGL support
3. **Security scanner failing**: Check file format validation
4. **Consent not saving**: Clear localStorage and retry

### Browser DevTools

- Use React DevTools
- Check Network tab for API calls
- Monitor Console for errors
- Use Performance tab for optimization

---

## 🚀 Performance Guidelines

### Optimization

- Minimize re-renders
- Use React.memo when appropriate
- Optimize audio processing
- Lazy load heavy components
- Compress assets

### Memory Management

- Clean up event listeners
- Release audio buffers
- Clear canvas contexts
- Manage Three.js resources

---

## 🔒 Security Considerations

### File Handling

- Validate all file inputs
- Check file signatures
- Limit file sizes
- Sanitize file names

### Data Privacy

- Never log sensitive data
- Clear data on user request
- Follow GDPR guidelines
- Protect user consent

---

## 📦 Dependencies

### Adding Dependencies

1. Check if existing packages cover the need
2. Evaluate package size and maintenance
3. Discuss in issue before adding
4. Update package.json
5. Run `npm install`

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update safely
npm update

# Update specific package
npm update package-name
```

---

## 🌐 Browser Compatibility

### Supported Browsers

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Required Features

- WebGL 2.0
- Web Audio API
- MediaRecorder API
- localStorage
- Canvas API

---

## 📞 Getting Help

### Resources

- Check existing issues
- Read documentation
- Search online resources
- Ask in discussions

### Contact

- Open a GitHub issue
- Join discussions
- Reach out to maintainers

---

## 🎉 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation
- Thanked in commits

---

## 📋 Checklist Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests pass successfully
- [ ] Documentation updated
- [ ] No console errors
- [ ] Responsive design works
- [ ] Security considerations addressed
- [ ] Performance optimized
- [ ] Commit messages are clear
- [ ] PR description is complete

---

Thank you for contributing to VoxForensics! 🚀

Together we can make the digital world safer. 🛡️
