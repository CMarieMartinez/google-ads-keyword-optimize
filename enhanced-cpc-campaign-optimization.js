Function main() {
    function keywordOptimize() {
        var keywordIterator = AdsApp.keywords()  // Get keywords from Google Ads api
            .withCondition('CampaignName = "Awesome CPC Campaign')
            .forDateRange('LAST_MONTH')
            .orderBy('Impressions DESC')
            .get();

        var paused = [];
        var low_ctr = [];
        var nothing = [];

        while (keywordIterator.hasNext()) {
            var keyword = keywordIterator.next();
            var stats = keyword.getStatsFor('LAST_MONTH');
            var CTR = stats.getCtr() * 100;  // Multiply decimal CTR by 100

            if (keyword.isEnabled()) {
                if (CTR > 5) {      // Get keywords with a CTR above 5%
                    var doubleCPC = stats.getAverageCpc() * 2;
                    var mediaCPC = stats.getAverageCpc() * 1.5;

                    if (stats.getImpressions() <= 100) {
                        keyword.bidding().setCpc(doubleCPC);     // Double CPC of promising keywords

                        Logger.log('Under 100 Impressions');
                        Logger.log(keyword.getText());
                        Logger.log('Impressions: ' + stats.getImpressions());
                        Logger.log('Clicks: ' + stats.getClicks());
                        Logger.log('CTR: ' + CTR.toFixed(2));
                        Logger.log('Conversions: ' + stats.getConversions());
                        Logger.log(' ');
                    } else {
                        Logger.log('Above 100 Impressions');
                        Logger.log(keyword.getText());
                        Logger.log('Impressions: ' + stats.getImpressions());
                        Logger.log('Clicks: ' + stats.getClicks());
                        Logger.log('CTR: ' + CTR.toFixed(2));
                        Logger.log('Conversions: ' + stats.getConversions());
                        Logger.log(' ');
                    }
                } else {
                    if (stats.getImpressions() < 5) {     // Get keywords with less than 5 impressions
                        if (stats.getImpressions() > 0) {
                            low_ctr.push(keyword.getText());
                            if (keyword.getMatchType() === 'BROAD') {
                                keyword.pause();       // Pause low performing broad match keywords
                            } else {
                                keyword.bidding().setCpc(mediaCPC);
                            }
                        } else {
                            nothing.push(keyword.getText());
                            keyword.pause();     // Pause keywords without impressions
                        }
                    }
                }
                
            } else {
                paused.push(keyword.getText());
                keyword.enable();
            }
        }
        Logger.log('Paused: ' + paused);
        Logger.log('Low CTR: ' + low_ctr);
        Logger.log('Nothing: ' + nothing);
    }
    keywordOptimize();
}
