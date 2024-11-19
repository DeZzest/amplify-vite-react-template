import React, { useEffect, useState } from 'react';
import style from './RichBar.module.css';
import {
	TbAlignBoxBottomCenter,
	TbAlignBoxLeftMiddle,
	TbAlignBoxRightMiddle,
	TbAlignBoxTopCenter,
} from 'react-icons/tb';
import { FaAlignCenter, FaAlignLeft, FaAlignRight } from 'react-icons/fa';
import { MdAlignVerticalBottom, MdAlignVerticalTop } from 'react-icons/md';
import { CgMoreO } from 'react-icons/cg';

interface Props {
	onChange?: (layountVariant: number, posVariant: number) => void;
}

export const RichBar: React.FC<Props> = ({ onChange }) => {
	const [layoutVariant, setLayoutVariant] = useState<number>(0);
	const [posVariant, setPosVariant] = useState<number>(0);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		onChange!(layoutVariant, posVariant);
	}, [posVariant, layoutVariant]);

	return (
		<div className={style.richBar}>
			<div className={style.btn} onClick={() => setVisible(!visible)}>
				<div>
					<CgMoreO size={20} />
				</div>
			</div>

			<div className={`${style.listGroup} ${visible && style.active}`}>
				<ul className={style.list}>
					<li
						onClick={() => {
							setLayoutVariant(0);
						}}
						className={`${style.item} ${layoutVariant === 0 && style.active}`}
					>
						<TbAlignBoxLeftMiddle size={25} />
					</li>
					<li
						onClick={() => {
							setLayoutVariant(1);
						}}
						className={`${style.item} ${layoutVariant === 1 && style.active}`}
					>
						<TbAlignBoxTopCenter size={25} />
					</li>
					<li
						onClick={() => {
							setLayoutVariant(2);
						}}
						className={`${style.item} ${layoutVariant === 2 && style.active}`}
					>
						<TbAlignBoxBottomCenter size={25} />
					</li>
					<li
						onClick={() => {
							setLayoutVariant(3);
						}}
						className={`${style.item} ${layoutVariant === 3 && style.active}`}
					>
						<TbAlignBoxRightMiddle size={25} />
					</li>
				</ul>

				<ul className={style.list}>
					<li
						className={`${style.item} ${posVariant === 0 && style.active}`}
						onClick={() => {
							setPosVariant(0);
						}}
					>
						{layoutVariant === 1 || layoutVariant === 2 ? (
							<FaAlignLeft />
						) : (
							<MdAlignVerticalTop />
						)}
					</li>
					<li
						className={`${style.item} ${posVariant === 1 && style.active}`}
						onClick={() => {
							setPosVariant(1);
						}}
					>
						<FaAlignCenter />
					</li>
					<li
						className={`${style.item} ${posVariant === 2 && style.active}`}
						onClick={() => {
							setPosVariant(2);
						}}
					>
						{layoutVariant === 1 || layoutVariant === 2 ? (
							<FaAlignRight />
						) : (
							<MdAlignVerticalBottom />
						)}
					</li>
				</ul>
			</div>
		</div>
	);
};
