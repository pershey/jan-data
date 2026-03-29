import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AdUnitIds } from '@/constants/ads';

export function BannerAdView() {
  const [adLoaded, setAdLoaded] = useState(false);

  const unitId = AdUnitIds.banner;
  if (!unitId) {
    return null;
  }

  return (
    <View style={[styles.container, !adLoaded && styles.hidden]}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdLoaded={() => setAdLoaded(true)}
        onAdFailedToLoad={(error) => {
          console.warn('広告読み込み失敗:', error.message);
          setAdLoaded(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 16,
  },
  hidden: {
    // 広告がロードされるまで高さ0で非表示
    height: 0,
    overflow: 'hidden',
  },
});
