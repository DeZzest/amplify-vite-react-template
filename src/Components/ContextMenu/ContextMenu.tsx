import React, { useEffect } from 'react';
import style from './ContextMenu.module.css';

interface ContextMenuProps {
	show: boolean;
	setShow: (value: boolean) => void;
	position: { x: number; y: number };
	save?: () => void;
	deleteMsg?: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
	position,
	setShow,
	show,
	deleteMsg,
	save,
}) => {
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const menu = document.getElementById('context-menu');
			if (menu && !menu.contains(event.target as Node)) {
				setShow(false);
			}
		};

		if (show) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [show, setShow]);

	const handleCopy = (event: React.MouseEvent) => {
		event.stopPropagation();

		save!();
		setShow(false);
	};

	const handleDelete = (event: React.MouseEvent) => {
		event.stopPropagation();
		deleteMsg!();
		setShow(false);
	};

	return (
		<div className="app" style={{ width: '100%', height: '100%' }}>
			{show && (
				<div
					id="context-menu"
					className={style.menu}
					style={{
						top: position.y,
						left: position.x,
						display: show ? 'block' : 'none',
					}}
				>
					<div className={style.item} onClick={handleCopy}>
						Copy
					</div>
					{deleteMsg && (
						<div className={style.item} onClick={handleDelete}>
							Delete
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default ContextMenu;
