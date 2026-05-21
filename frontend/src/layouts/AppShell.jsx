import { Sidebar } from './Sidebar.jsx';
import { TopBar } from './TopBar.jsx';
import { RightRail } from './RightRail.jsx';
import { BottomNav } from './BottomNav.jsx';

export function AppShell({ title, subtitle, search, onSearch, searchPlaceholder, showSearch = true, showRail = true, children }) {
  return (
    <div className="shell">
      <Sidebar />
      <div className="shell__main">
        <TopBar
          title={title}
          subtitle={subtitle}
          showSearch={showSearch}
          search={search}
          onSearch={onSearch}
          searchPlaceholder={searchPlaceholder}
        />
        <div className="shell__body">
          <main className="shell__content">{children}</main>
          {showRail && (
            <div className="shell__rail-wrap">
              <RightRail />
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
