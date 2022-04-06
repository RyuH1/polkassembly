// Copyright 2019-2020 @Premiurly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Bounties from 'src/screens/Bounties';
import PostBounty from 'src/screens/BountyPost';
import CalendarView from 'src/screens/CalendarView';
import Council from 'src/screens/Council';
import CreatePost from 'src/screens/CreatePost';
import PostDiscussion from 'src/screens/DiscussionPost';
import Discussions from 'src/screens/Discussions';
import Home from 'src/screens/Home';
import Parachains from 'src/screens/Home/Parachains';
import { PrivacyPolicy, TermsAndConditions, TermsOfWebsite } from 'src/screens/LegalDocuments';
import LoginForm from 'src/screens/LoginForm';
import PostMotion from 'src/screens/MotionPost';
import Motions from 'src/screens/Motions';
import NewsView from 'src/screens/NewsView';
import NotFound from 'src/screens/NotFound';
import NotificationSettings from 'src/screens/NotificationSettings';
import OnChain from 'src/screens/OnChain';
import Profile from 'src/screens/Profile';
import PostProposal from 'src/screens/ProposalPost';
import Proposals from 'src/screens/Proposals';
import Referenda from 'src/screens/Referenda';
import PostReferendum from 'src/screens/ReferendumPost';
import RequestResetPassword from 'src/screens/RequestResetPassword';
import ResetPassword from 'src/screens/ResetPassword';
import Search from 'src/screens/Search';
import Settings from 'src/screens/Settings';
import SignupForm from 'src/screens/SignupForm';
import PostTechCommitteeProposal from 'src/screens/TechCommitteeProposalPost';
import TechCommitteeProposals from 'src/screens/TechCommitteeProposals';
import PostTip from 'src/screens/TipPost';
import Tips from 'src/screens/Tips';
import Tracker from 'src/screens/Tracker';
import Treasury from 'src/screens/Treasury';
import PostTreasury from 'src/screens/TreasuryPost';
import UndoEmailChange from 'src/screens/UndoEmailChange';
import UserProfile from 'src/screens/UserProfile';
import VerifyEmail from 'src/screens/VerifyEmail';

function SwitchRoutes() {
	return (
		<Switch>
			<Route exact path="/">
				<Home/>
			</Route>
			<Route path="/discussions">
				<Discussions/>
			</Route>
			<Route path="/login">
				<LoginForm/>
			</Route>
			<Route path="/post/create">
				<CreatePost/>
			</Route>
			<Route exact path="/bounty/:id">
				<PostBounty/>
			</Route>
			<Route exact path="/motion/:id">
				<PostMotion/>
			</Route>
			<Route exact path="/proposal/:id">
				<PostProposal/>
			</Route>
			<Route exact path="/referendum/:id">
				<PostReferendum/>
			</Route>
			<Route exact path="/treasury/:id">
				<PostTreasury/>
			</Route>
			<Route exact path="/tech/:id">
				<PostTechCommitteeProposal/>
			</Route>
			<Route exact path="/tip/:hash">
				<PostTip/>
			</Route>
			<Route exact path="/post/:id">
				<PostDiscussion/>
			</Route>
			<Route path="/onchain">
				<OnChain/>
			</Route>
			<Route path="/bounties">
				<Bounties/>
			</Route>
			<Route path="/referenda">
				<Referenda/>
			</Route>
			<Route path="/proposals">
				<Proposals/>
			</Route>
			<Route path="/motions">
				<Motions/>
			</Route>
			<Route path="/treasury-proposals">
				<Treasury/>
			</Route>
			<Route path="/tech-comm-proposals">
				<TechCommitteeProposals/>
			</Route>
			<Route path="/tips">
				<Tips/>
			</Route>
			<Route path="/request-reset-password">
				<RequestResetPassword/>
			</Route>
			<Route path="/reset-password">
				<ResetPassword/>
			</Route>
			<Route path="/signup">
				<SignupForm/>
			</Route>
			<Route path="/verify-email/:token">
				<VerifyEmail/>
			</Route>
			<Route path="/undo-email-change/:token">
				<UndoEmailChange/>
			</Route>
			<Route path="/settings">
				<Settings/>
			</Route>
			<Route path="/notification-settings">
				<NotificationSettings/>
			</Route>
			<Route path="/terms-and-conditions">
				<TermsAndConditions/>
			</Route>
			<Route path="/terms-of-website">
				<TermsOfWebsite/>
			</Route>
			<Route path="/privacy">
				<PrivacyPolicy/>
			</Route>
			<Route path="/user/:username">
				<UserProfile/>
			</Route>
			<Route path="/search">
				<Search/>
			</Route>
			<Route path="/tracker">
				<Tracker/>
			</Route>
			<Route path="/council">
				<Council/>
			</Route>
			<Route path="/profile/:address">
				<Profile/>
			</Route>
			<Route path="/calendar">
				<CalendarView/>
			</Route>
			<Route path="/news">
				<NewsView/>
			</Route>
			<Route path="/parachains">
				<Parachains/>
			</Route>
			<Route path="*">
				<NotFound/>
			</Route>
		</Switch>
	);
}

export default SwitchRoutes;

