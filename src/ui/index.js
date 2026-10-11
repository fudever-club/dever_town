/**
 * DEVER TOWN - UI Components Barrel Export
 */

// 1. Auth & Entry
export { WelcomeGate } from './auth/WelcomeGate.js';
export { AuthModal } from './auth/AuthModal.js';
export { NicknameModal } from './auth/NicknameModal.js';
export { DeviceApprovalModal } from './auth/DeviceApprovalModal.js';

// 2. Gameplay & Modals
export { InteractiveModal } from './gameplay/InteractiveModal.js';
import './gameplay/InteractiveModal.dream.js'; // Dream mini-game patch (separate file, API push limit)
export { InventoryModal } from './gameplay/InventoryModal.js';
export { QuestModal } from './gameplay/QuestModal.js';
export { WardrobeModal } from './gameplay/WardrobeModal.js';
export { NPCDialogueModal } from './gameplay/NPCDialogueModal.js';

// 3. Minigames & Tools
export { RetroArcade } from './minigames/RetroArcade.js';
export { SportsArcade } from './minigames/SportsArcade.js';
export { PomodoroTimer } from './minigames/PomodoroTimer.js';
export { SpeedCodeDuel } from './minigames/SpeedCodeDuel.js';
export { QuizMultiplayerModal } from './minigames/QuizMultiplayerModal.js';

// 4. Common, HUD & Controls
export { ChatBox } from './common/ChatBox.js';
export { OnboardingGuide } from './common/OnboardingGuide.js';
export { CoachMarks } from './common/CoachMarks.js';
export { SettingsModal } from './common/SettingsModal.js';
export { TouchControls } from './common/TouchControls.js';
export { AnalogStick } from './common/AnalogStick.js';
export { NetworkStatusOverlay } from './common/NetworkStatusOverlay.js';
export { ToastManager, toastManager, TOAST_CONFIG } from './common/ToastManager.js';
export { MinimapOverlay } from './common/MinimapOverlay.js';
export { RoomBanner } from './common/RoomBanner.js';
export { EmoteBar } from './common/EmoteBar.js';
export { DailyGoalHUD } from './common/DailyGoalHUD.js';
export { PlayerProfileModal } from './gameplay/PlayerProfileModal.js';
export { FriendRequestModal } from './gameplay/FriendRequestModal.js';
export { FriendsListModal } from './gameplay/FriendsListModal.js';
export { AvatarSelectorModal, UNLOCKABLE_AVATARS } from './gameplay/AvatarSelectorModal.js';
export { RadialEmoteWheel } from './gameplay/RadialEmoteWheel.js';
export { CampusTimeHUD } from './common/CampusTimeHUD.js';


