import { ComponentProps, ReactNode, useMemo } from 'react';
import useIsLiveChatWidgetAvailable from '@/components/chat/useIsLiveChatWidgetAvailable';

import { useOauth2 } from '@/hooks/auth/useOauth2';
import { useFirebaseCountriesConfig } from '@/hooks/firebase/useFirebaseCountriesConfig';
import useRemoteConfig from '@/hooks/growthbook/useRemoteConfig';
import useThemeSwitcher from '@/hooks/useThemeSwitcher';

import RootStore from '@/stores/root-store';
import { LegacyTheme1pxIcon } from '@deriv/quill-icons/Legacy';
import { useTranslations } from '@deriv-com/translations';
import { ToggleSwitch } from '@deriv-com/ui';

export type TSubmenuSection = 'accountSettings' | 'cashier' | 'reports';

//IconTypes
type TMenuConfig = {
    LeftComponent: React.ElementType;
    RightComponent?: ReactNode;
    as: 'a' | 'button';
    href?: string;
    label: ReactNode;
    onClick?: () => void;
    removeBorderBottom?: boolean;
    submenu?: TSubmenuSection;
    target?: ComponentProps<'a'>['target'];
    isActive?: boolean;
}[];

const useMobileMenuConfig = (client?: RootStore['client']) => {
    const { localize } = useTranslations();
    const { is_dark_mode_on, toggleTheme } = useThemeSwitcher();

    useOauth2({ handleLogout: async () => client?.logout(), client });

    useRemoteConfig(true);

    useIsLiveChatWidgetAvailable();
    useIsIntercomAvailable();

    const menuConfig = useMemo(
        (): TMenuConfig[] => [
            [
                {
                    as: 'button',
                    label: localize('Dark theme'),
                    LeftComponent: LegacyTheme1pxIcon,
                    RightComponent: <ToggleSwitch value={is_dark_mode_on} onChange={toggleTheme} />,
                    removeBorderBottom: true,
                },
            ].filter(Boolean) as TMenuConfig,
        ],
        [is_dark_mode_on, toggleTheme]
    );

    return {
        config: menuConfig,
    };
};

export default useMobileMenuConfig;
