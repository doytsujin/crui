import { Component, Tag } from '../dom/index';
import { text } from './text';
import { hc } from './children';

export function ht(tag: Tag, txt: string): Component {
    return hc(tag, [
        text(txt)
    ])
}