/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, initialiseDOM, element, click } from "../reactTestExtensions";
import Footer from "../../src/client/Footer";


describe("Footer", () => {

    const defaultProps = {
        router: {
            navigate: jest.fn(),
            state: { location: { pathname: "/" } }
        }
    };
    const searchButton = () => element(".anticon-search");
    const studyButton = () => element(".anticon-bulb");
    const exampleButton = () => element(".anticon-question");
    beforeEach(() => {
        initialiseDOM();
    });

    it("displays search, example and study icons", () => {
        const footer = render(<Footer {...defaultProps}/>);
        expect(searchButton()).not.toBeNull();
        expect(exampleButton()).not.toBeNull();
        expect(studyButton()).not.toBeNull();
    })

    it('defaults to the search page', () => {
        const footer = render(<Footer {...defaultProps}/>);
        expect(searchButton().parentElement.parentElement.parentElement.classList).toContain("ant-segmented-item-selected");
    });

    it('is set to study page when router is /search', () => {
        let router = {
            navigate: jest.fn(),
            state: { location: { pathname: "/study" } }
        }
        const footer = render(<Footer {...defaultProps} router={router}/>);
        expect(studyButton().parentElement.parentElement.parentElement.classList).toContain("ant-segmented-item-selected");
    });

    it('is set to example page when router is /example', () => {
        let router = {
            navigate: jest.fn(),
            state: { location: { pathname: "/exampleGenerator" } }
        }
        const footer = render(<Footer {...defaultProps} router={router}/>);
        expect(exampleButton().parentElement.parentElement.parentElement.classList).toContain("ant-segmented-item-selected");
    });

    it("navigates to study page when study icon is clicked", () => {
        const footer = render(<Footer {...defaultProps}/>);
        click(studyButton());
        expect(defaultProps.router.navigate).toHaveBeenCalledWith("/study");
    })

    it("navigates to example page when example icon is clicked", () => {
        const footer = render(<Footer {...defaultProps}/>);
        click(exampleButton());
        expect(defaultProps.router.navigate).toHaveBeenCalledWith("/exampleGenerator");
    })

    it("navigates to search page when search icon is clicked", () => {
        const footer = render(<Footer {...defaultProps}/>);
        click(studyButton());
        click(searchButton());
        expect(defaultProps.router.navigate).toHaveBeenCalledWith("/search");
    })
});