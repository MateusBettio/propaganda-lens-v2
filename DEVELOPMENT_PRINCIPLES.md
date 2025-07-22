# Development Principles

## Project Overview
Propaganda Lens V2 is a mobile application built with Expo and React Native for analyzing shared content and identifying potential propaganda or misleading information.

## Core Principles

### 1. Security First
- Never commit API keys, credentials, or sensitive data to version control
- Use environment variables for all configuration
- Implement proper input validation and sanitization
- Follow OWASP mobile security guidelines

### 2. User Experience
- Prioritize accessibility and inclusive design
- Maintain consistent UI/UX patterns across platforms
- Implement proper error handling with user-friendly messages
- Optimize for performance on both iOS and Android

### 3. Code Quality
- Use TypeScript for type safety
- Implement comprehensive testing (unit, integration, e2e)
- Follow React Native and Expo best practices
- Maintain consistent code formatting with Prettier/ESLint
- Write self-documenting code with meaningful variable names

### 4. Architecture
- Use Expo Router for navigation
- Implement proper state management (React Context/Redux)
- Separate business logic from UI components
- Use custom hooks for reusable logic
- Implement proper error boundaries

### 5. Data Privacy
- Minimize data collection to essential functionality only
- Implement proper data encryption for sensitive information
- Provide clear privacy controls to users
- Follow GDPR and other privacy regulations

### 6. Performance
- Optimize images and assets for mobile devices
- Implement proper caching strategies
- Use lazy loading where appropriate
- Monitor and optimize bundle size
- Test on real devices, not just simulators

### 7. Maintainability
- Write comprehensive documentation
- Use meaningful commit messages
- Implement proper branching strategy
- Keep dependencies up to date
- Regular code reviews and refactoring

### 8. Cross-Platform Compatibility
- Test on both iOS and Android devices
- Handle platform-specific differences gracefully
- Use platform-appropriate UI patterns
- Ensure feature parity across platforms

### 9. Offline Capability
- Implement offline-first approach where possible
- Provide meaningful feedback when offline
- Cache essential data locally
- Handle network connectivity changes

### 10. Analytics and Monitoring
- Implement crash reporting and error tracking
- Monitor app performance metrics
- Track user engagement responsibly
- Use analytics to drive feature decisions


MANDATORY DEVELOPMENT PRINCIPLES FOR THIS PROJECT
Core Philosophy

Simplicity is the ultimate sophistication
Every line of code is a liability - write less, accomplish more
If you can't explain it simply, it's too complex
Working code > Perfect code, but never compromise on quality

Code Quality Standards
1. SIMPLICITY FIRST

No premature optimization
No over-engineering
Use built-in solutions before adding dependencies
One component = one clear purpose
Functions should do ONE thing well
Max 100 lines per file (split if larger)
Max 20 lines per function (refactor if larger)

2. ZERO TECH DEBT POLICY

Fix issues immediately, don't add TODOs
No "temporary" solutions - they become permanent
If something feels hacky, stop and redesign
Don't copy-paste code - create reusable functions
Update dependencies regularly
Remove unused code immediately

3. MAINTAINABILITY
typescript// ❌ Bad: Unclear naming and magic numbers
const d = u.filter(x => x.s > 5)

// ✅ Good: Self-documenting code
const activeUsers = users.filter(user => user.sessionCount > MINIMUM_ACTIVE_SESSIONS)

Use descriptive variable names (no single letters except in loops)
Add JSDoc comments for all functions
Group related functionality
Consistent file naming: kebab-case for files, PascalCase for components
Clear folder structure - a new developer should understand in 5 minutes

4. PERFORMANCE & SCALABILITY

Lazy load components and routes
Implement proper loading states (no blank screens)
Cache API responses appropriately
Use React.memo() for expensive components
Virtualize long lists (>50 items)
Optimize images before adding to assets
Monitor bundle size - investigate if it grows >10%

5. CRASH & BUG RESISTANCE
typescript// Every API call MUST have error handling
try {
  const data = await apiCall()
  // Handle success
} catch (error) {
  console.error('Specific error context:', error)
  // Show user-friendly error
  // Provide fallback behavior
}

NEVER assume API calls succeed
ALWAYS provide fallback UI for errors
Validate all external data
Use TypeScript strictly (no 'any' types)
Handle edge cases: empty states, offline mode, permission denied
Test on real devices, not just simulator

6. SECURITY STANDARDS
typescript// ❌ NEVER commit sensitive data
const API_KEY = "sk-abc123..." // NEVER DO THIS

// ✅ Always use environment variables
const API_KEY = process.env.EXPO_PUBLIC_API_KEY

Use .env.example file to document required variables
Add all sensitive files to .gitignore BEFORE first commit
Never log sensitive data
Validate and sanitize all user inputs
Use HTTPS for all external requests
Implement proper authentication checks

7. REACT/REACT NATIVE BEST PRACTICES
typescript// ❌ Bad: Direct state mutation
state.items.push(newItem)

// ✅ Good: Immutable updates
setState(prev => ({
  items: [...prev.items, newItem]
}))

Use functional components only (no class components)
Custom hooks for shared logic
Proper dependency arrays in useEffect
Avoid inline styles - use StyleSheet
Handle component unmounting properly
Use React.Suspense for code splitting

8. TESTING & VALIDATION

Test share functionality on REAL devices
Test with poor network (3G throttling)
Test with large data sets
Validate on both iOS and Android
Test offline scenarios
Check memory usage doesn't grow over time

9. USER EXPERIENCE STANDARDS

Every action needs feedback (loading, success, error)
Animations should be smooth (60fps)
Touch targets minimum 44x44 points
Respect platform conventions (iOS vs Android)
Implement pull-to-refresh where appropriate
Show empty states, not blank screens

10. GIT & VERSION CONTROL
bash# ❌ Bad commits
git commit -m "fix stuff"
git commit -m "WIP"

# ✅ Good commits
git commit -m "fix: prevent crash when share content is empty"
git commit -m "feat: add offline support for recent analyses"

Commit messages: type(scope): description
Types: feat, fix, docs, style, refactor, test, chore
Commit working code only
One feature per commit
Review changes before committing

Decision Making Framework
When facing architectural decisions, ask:

Is this the simplest solution that works?
Will a new developer understand this in 5 minutes?
Does this handle errors gracefully?
Is this performant for 10,000 users?
Can this be tested easily?

If any answer is "no", reconsider the approach.
Forbidden Practices

NO console.log in production code (use proper logging)
NO hardcoded values (use constants)
NO ignored TypeScript errors
NO setTimeout for waiting on async operations
NO force unwrapping without null checks
NO catching errors without handling them
NO infinite loops or recursive calls without limits
NO blocking the main thread

Code Review Checklist
Before completing any feature:

 Code is self-documenting
 Error scenarios handled
 Loading states implemented
 Works offline (if applicable)
 No TypeScript errors
 Tested on both platforms
 No sensitive data exposed
 Performance impact considered
 Accessibility considered
 Memory leaks checked

Remember: We're building an app that should work flawlessly for 100,000 users, not just a prototype. Every decision should consider the worried parent trying to protect their kids, the critical thinker analyzing content, and the busy professional who needs it to "just work."
Quality is not negotiable. If something needs more time to be done right, take the time.