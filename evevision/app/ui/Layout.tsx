import React from 'react';

export interface LayoutProps {children: React.ReactNode}

export const WindowButtons: React.FC<LayoutProps> = (props: LayoutProps) => <div className="eve-window-buttons">{props.children}</div>
export const Typography: React.FC<LayoutProps> = (props: LayoutProps) => <div className="eve-typography">{props.children}</div>

export interface PanelProps extends LayoutProps {focused: boolean, secure: boolean}
export const Panel: React.FC<PanelProps> = (props: PanelProps) => <div className={"eve-panel" + (props.focused ? ' focused' : '') + (props.secure ? ' secure' : '')}>{props.children}</div>