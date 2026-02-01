import { useTranslations } from '@deriv-com/translations';
import { Text, useDevice } from '@deriv-com/ui';

const MenuHeader = () => {
    const { localize } = useTranslations();
    const { isDesktop } = useDevice();

    return (
        <div className='mobile-menu__header'>
            <Text size={isDesktop ? 'md' : 'lg'} weight='bold'>
                {localize('Menu')}
            </Text>
        </div>
    );
};

export default MenuHeader;
