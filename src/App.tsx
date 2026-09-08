import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Navbar } from "./components/layout/Navbar";
import { Sidebar } from "./components/layout/Sidebar";
import { CommandPalette } from "./components/layout/CommandPalette";
import { ToolPermissionModal } from "./components/layout/ToolPermissionModal";
import { Notifications } from "./components/layout/Notifications";

// Views
import { HomeView } from "./components/views/HomeView";
import { ChatView } from "./components/views/ChatView";
import { DeepResearchView } from "./components/views/DeepResearchView";
import { ProjectsView } from "./components/views/ProjectsView";
import { AgentsView } from "./components/views/AgentsView";
import { KnowledgeBaseView } from "./components/views/KnowledgeBaseView";
import { DocumentsView } from "./components/views/DocumentsView";
import { CodingLabView } from "./components/views/CodingLabView";
import { DataAnalystView } from "./components/views/DataAnalystView";
import { ImageStudioView } from "./components/views/ImageStudioView";
import { VoiceView } from "./components/views/VoiceView";
import { HistoryView } from "./components/views/HistoryView";
import { SettingsView } from "./components/views/SettingsView";

const AppContent: React.FC = () => {
  const { currentSection } = useApp();
  const [sidebarOpenMobile, setSidebarOpenMobile] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const renderCurrentView = () => {
    switch (currentSection) {
      case "home":
        return <HomeView />;
      case "chat":
        return <ChatView />;
      case "research":
        return <DeepResearchView />;
      case "projects":
        return <ProjectsView />;
      case "agents":
        return <AgentsView />;
      case "knowledge":
        return <KnowledgeBaseView />;
      case "documents":
        return <DocumentsView />;
      case "code":
        return <CodingLabView />;
      case "data":
        return <DataAnalystView />;
      case "image":
        return <ImageStudioView />;
      case "voice":
        return <VoiceView />;
      case "history":
        return <HistoryView />;
      case "settings":
        return <SettingsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 antialiased font-sans transition-colors duration-200">
      {/* Persistent Sidebar */}
      <Sidebar
        isOpen={sidebarOpenMobile}
        onCloseMobile={() => setSidebarOpenMobile(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navbar */}
        <Navbar onToggleSidebar={() => setSidebarOpenMobile((prev) => !prev)} />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          {renderCurrentView()}
        </main>
      </div>

      {/* Global Interactive Overlays */}
      <CommandPalette />
      <ToolPermissionModal />
      <Notifications />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
