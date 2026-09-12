# Virtualizer

<a id="source-virtual-docs-api-virtualizer-md"></a>

Release-matched documentation · `@tanstack/virtual-core@3.17.10`.

[Topic index](../foundations.md) · [Source provenance](../SOURCES.md)

## Choose a section

Read the overview or setup when it is a prerequisite, then the section needed for the task.

- [Overview](./virtual-docs-api-virtualizer-md-c3b477a3--overview.md) — 1 KiB
- [Required Options](./virtual-docs-api-virtualizer-md-c3b477a3--required-options.md) — 2 KiB
- [Optional Options: `enabled`](./virtual-docs-api-virtualizer-md-c3b477a3--optional-options-enabled.md) — 1 KiB
- [Optional Options: `debug`](./virtual-docs-api-virtualizer-md-c3b477a3--optional-options-debug.md) — 1 KiB
- [Optional Options: `initialRect`](./virtual-docs-api-virtualizer-md-c3b477a3--optional-options-initialrect.md) — 1 KiB
- [Optional Options: `onChange`](./virtual-docs-api-virtualizer-md-c3b477a3--optional-options-onchange.md) — 1 KiB
- [Optional Options: `overscan`](./virtual-docs-api-virtualizer-md-c3b477a3--optional-options-overscan.md) — 1 KiB
- [Optional Options: `horizontal`](./virtual-docs-api-virtualizer-md-c3b477a3--optional-options-horizontal.md) — 1 KiB
- [Optional Options: `paddingStart`](./virtual-docs-api-virtualizer-md-c3b477a3--optional-options-paddingstart.md) — 1 KiB
- [Optional Options: `paddingEnd`](./virtual-docs-api-virtualizer-md-c3b477a3--optional-options-paddingend.md) — 1 KiB
- [Optional Options: `scrollPaddingStart`](./virtual-docs-api-virtualizer-md-c3b477a3--optional-options-scrollpaddingstart.md) — 1 KiB
- [Optional Options: `scrollPaddingEnd`](./virtual-docs-api-virtualizer-md-c3b477a3--optional-options-scrollpaddingend.md) — 1 KiB
- [Optional Options: `initialOffset`](./virtual-docs-api-virtualizer-md-c3b477a3--optional-options-initialoffset.md) — 1 KiB
- [Optional Options: `getItemKey`](./virtual-docs-api-virtualizer-md-c3b477a3--optional-options-getitemkey.md) — 1 KiB
- [Optional Options: `rangeExtractor`](./virtual-docs-api-virtualizer-md-c3b477a3--optional-options-rangeextractor.md) — 1 KiB
- [Optional Options: `scrollToFn`](./virtual-docs-api-virtualizer-md-c3b477a3--optional-options-scrolltofn.md) — 2 KiB
- [Optional Options: `observeElementRect`](./virtual-docs-api-virtualizer-md-c3b477a3--optional-options-observeelementrect.md) — 1 KiB
- [Optional Options: `observeElementOffset`](./virtual-docs-api-virtualizer-md-c3b477a3--optional-options-observeelementoffset.md) — 1 KiB
- [Optional Options: `measureElement`](./virtual-docs-api-virtualizer-md-c3b477a3--optional-options-measureelement.md) — 1 KiB
- [Optional Options: `scrollMargin`](./virtual-docs-api-virtualizer-md-c3b477a3--optional-options-scrollmargin.md) — 2 KiB
- [Optional Options: `gap`](./virtual-docs-api-virtualizer-md-c3b477a3--optional-options-gap.md) — 1 KiB
- [Optional Options: `lanes`](./virtual-docs-api-virtualizer-md-c3b477a3--optional-options-lanes.md) — 1 KiB
- [Optional Options: `laneAssignmentMode`](./virtual-docs-api-virtualizer-md-c3b477a3--optional-options-laneassignmentmode.md) — 1 KiB
- [Optional Options: `anchorTo`](./virtual-docs-api-virtualizer-md-c3b477a3--optional-options-anchorto.md) — 1 KiB
- [Optional Options: `followOnAppend`](./virtual-docs-api-virtualizer-md-c3b477a3--optional-options-followonappend.md) — 2 KiB
- [Optional Options: `scrollEndThreshold`](./virtual-docs-api-virtualizer-md-c3b477a3--optional-options-scrollendthreshold.md) — 1 KiB
- [Optional Options: `isScrollingResetDelay`](./virtual-docs-api-virtualizer-md-c3b477a3--optional-options-isscrollingresetdelay.md) — 1 KiB
- [Optional Options: `useScrollendEvent`](./virtual-docs-api-virtualizer-md-c3b477a3--optional-options-usescrollendevent.md) — 1 KiB
- [Optional Options: `isRtl`](./virtual-docs-api-virtualizer-md-c3b477a3--optional-options-isrtl.md) — 1 KiB
- [Optional Options: `initialMeasurementsCache`](./virtual-docs-api-virtualizer-md-c3b477a3--optional-options-initialmeasurementscache.md) — 1 KiB
- [Optional Options: `useAnimationFrameWithResizeObserver`](./virtual-docs-api-virtualizer-md-c3b477a3--optional-options-useanimationframewithresizeobserver.md) — 2 KiB
- [Optional Options: `useCachedMeasurements`](./virtual-docs-api-virtualizer-md-c3b477a3--optional-options-usecachedmeasurements.md) — 2 KiB
- [Virtualizer Instance](./virtual-docs-api-virtualizer-md-c3b477a3--virtualizer-instance.md) — 9 KiB

<!-- Original source anchors retained for inbound links. -->
<a id="required-options"></a>
<a id="count"></a>
<a id="getscrollelement"></a>
<a id="estimatesize"></a>
<a id="optional-options"></a>
<a id="enabled"></a>
<a id="debug"></a>
<a id="initialrect"></a>
<a id="onchange"></a>
<a id="overscan"></a>
<a id="horizontal"></a>
<a id="paddingstart"></a>
<a id="paddingend"></a>
<a id="scrollpaddingstart"></a>
<a id="scrollpaddingend"></a>
<a id="initialoffset"></a>
<a id="getitemkey"></a>
<a id="rangeextractor"></a>
<a id="scrolltofn"></a>
<a id="observeelementrect"></a>
<a id="observeelementoffset"></a>
<a id="measureelement"></a>
<a id="scrollmargin"></a>
<a id="gap"></a>
<a id="lanes"></a>
<a id="laneassignmentmode"></a>
<a id="anchorto"></a>
<a id="followonappend"></a>
<a id="scrollendthreshold"></a>
<a id="isscrollingresetdelay"></a>
<a id="usescrollendevent"></a>
<a id="isrtl"></a>
<a id="initialmeasurementscache"></a>
<a id="useanimationframewithresizeobserver"></a>
<a id="usecachedmeasurements"></a>
<a id="virtualizer-instance"></a>
<a id="options"></a>
<a id="scrollelement"></a>
<a id="getvirtualitems"></a>
<a id="getvirtualindexes"></a>
<a id="scrolltooffset"></a>
<a id="scrolltoindex"></a>
<a id="scrollby"></a>
<a id="scrolltoend"></a>
<a id="getdistancefromend"></a>
<a id="isatend"></a>
<a id="gettotalsize"></a>
<a id="measure"></a>
<a id="takesnapshot"></a>
<a id="measureelement-1"></a>
<a id="resizeitem"></a>
<a id="scrollrect"></a>
<a id="shouldadjustscrollpositiononitemsizechange"></a>
<a id="isscrolling"></a>
<a id="scrolldirection"></a>
<a id="scrolloffset"></a>
