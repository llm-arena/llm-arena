'use client';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@model-arena/ui';
import { useTranslations } from 'next-intl';
import { AppConfig } from '@/utils/AppConfig';

export const BaseTemplate = (props: {
  leftNav?: React.ReactNode;
  rightNav?: React.ReactNode;
  children: React.ReactNode;
  showSidebar?: boolean;
}) => {
  const t = useTranslations('BaseTemplate');
  const showSidebar = props.showSidebar ?? true;

  return (
    <div className="flex h-screen w-full flex-col">
      {/* Header */}
      <header className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{AppConfig.name}</h1>
            <p className="text-sm text-muted-foreground">{t('description')}</p>
          </div>
          <nav>
            <ul className="flex items-center gap-4">{props.rightNav}</ul>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {showSidebar && props.leftNav ? (
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            {/* Sidebar */}
            <ResizablePanel defaultSize={15} minSize={10} maxSize={25}>
              <aside className="h-full overflow-y-auto border-r bg-muted/10 p-4">
                <nav aria-label="Main navigation">
                  <ul className="space-y-2">{props.leftNav}</ul>
                </nav>
              </aside>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Main Content */}
            <ResizablePanel defaultSize={85}>
              <main className="h-full overflow-y-auto p-6">{props.children}</main>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <main className="flex-1 overflow-y-auto p-6">{props.children}</main>
        )}

        {/* Footer */}
        <footer className="px-6 py-2 text-center text-xs text-muted-foreground/60">
          {`© ${new Date().getFullYear()} ${AppConfig.name}`}
        </footer>
      </div>
    </div>
  );
};
