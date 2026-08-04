import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import NotFound from './pages/NotFound/NotFound';
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import WizardProfilePage from './pages/WizardProfile/WizardProfilePage';
import WizardInterviewPage from './pages/WizardInterview/WizardInterviewPage';
import WizardModelPage from './pages/WizardModel/WizardModelPage';
import WizardPortraitPage from './pages/WizardPortrait/WizardPortraitPage';
import WizardCandidatesPage from './pages/WizardCandidates/WizardCandidatesPage';
import WizardTeamPage from './pages/WizardTeam/WizardTeamPage';

const RoutesComponent = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="auth/login" element={<LoginPage />} />
        <Route path="auth/register" element={<RegisterPage />} />
        <Route path="wizard/profile" element={<WizardProfilePage />} />
        <Route path="wizard/interview" element={<WizardInterviewPage />} />
        <Route path="wizard/model" element={<WizardModelPage />} />
        <Route path="wizard/portrait" element={<WizardPortraitPage />} />
        <Route path="wizard/candidates" element={<WizardCandidatesPage />} />
        <Route path="wizard/team" element={<WizardTeamPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default RoutesComponent;
