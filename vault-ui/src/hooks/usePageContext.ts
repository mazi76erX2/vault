import {useContext} from 'react';
import {PageContext} from '../contexts/PageContext';
export const usePageContext = () => useContext(PageContext);