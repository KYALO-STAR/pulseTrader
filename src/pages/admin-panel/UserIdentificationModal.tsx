import React, { useEffect, useState } from 'react';
import './user-identification-modal.scss';

interface UserIdentificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (name: string, email: string) => void;
    defaultName?: string;
    defaultEmail?: string;
}

const UserIdentificationModal: React.FC<UserIdentificationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    defaultName = '',
    defaultEmail = '',
}) => {
    const [name, setName] = useState(defaultName);
    const [email, setEmail] = useState(defaultEmail);

    useEffect(() => {
        setName(defaultName);
        setEmail(defaultEmail);
    }, [defaultName, defaultEmail]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (name.trim() && email.trim()) {
            onConfirm(name, email);
        } else {
            alert('Please enter your name and email address.');
        }
    };

    return (
        <div className='user-identification-modal-overlay'>
            <div className='user-identification-modal-content'>
                <h2>Identify Yourself to Save Changes</h2>
                <p>Please enter your name and email for the change history log.</p>
                <div className='form-group'>
                    <label htmlFor='userName'>Name:</label>
                    <input
                        type='text'
                        id='userName'
                        className='input-field'
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder='Your Name'
                    />
                </div>
                <div className='form-group'>
                    <label htmlFor='userEmail'>Email:</label>
                    <input
                        type='email'
                        id='userEmail'
                        className='input-field'
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder='your.email@example.com'
                    />
                </div>
                <div className='modal-actions'>
                    <button className='cancel-btn' onClick={onClose}>
                        Cancel
                    </button>
                    <button className='confirm-btn' onClick={handleConfirm}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserIdentificationModal;
