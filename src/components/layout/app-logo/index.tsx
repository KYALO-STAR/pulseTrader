import { LegacyMenuHamburger1pxIcon } from '@deriv/quill-icons/Legacy';
import { useDevice } from '@deriv-com/ui';
// Custom icons to match uploaded images exactly
import './app-logo.scss';

// Menu Icon for mobile/tablet
const MenuIcon = ({ onClick }: { onClick: () => void }) => (
    <button className='app-header__menu-icon-button' onClick={onClick} type='button' aria-label='Open menu'>
        <LegacyMenuHamburger1pxIcon iconSize='sm' fill='var(--text-general)' />
    </button>
);

// Logo asset served from public folder
