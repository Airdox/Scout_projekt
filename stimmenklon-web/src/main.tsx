hether the reference is write-only.
     * @function Reference#isWriteOnly
     * @returns {boolean} write only
     */
    isWriteOnly() {
        return this.flag === Reference.WRITE;
    }

    /**
     * Whether the reference 