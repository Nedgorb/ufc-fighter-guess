import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

import FighterOfTheDay from './components/FighterOfTheDay';
import UnlimitedMode from './components/UnlimitedMode';
import SignInPage from './components/SignInPage'; // we'll make this next

import './index.css';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <Router>
        <Routes>
          {/* Public route */}
          <Route path="/" element={<FighterOfTheDay />} />

          {/* Protected route for Unlimited Mode */}
          <Route
            path="/unlimited"
            element={
              <>
                <SignedIn>
                  <UnlimitedMode />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />

          {/* Sign-in route */}
          <Route path="/sign-in" element={<SignInPage />} />
        </Routes>
      </Router>
    </ClerkProvider>
  </React.StrictMode>
);
