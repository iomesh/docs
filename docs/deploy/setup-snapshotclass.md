---
id: setup-snapshotclass
title: Setup SnapshotClass
sidebar_label: Setup SnapshotClass
---


```yaml
snapshotclass.yaml
```

```output
apiVersion: snapshot.storage.k8s.io/v1beta1
kind: VolumeSnapshotClass
metadata:
  name: iomesh-csi-driver-default
driver: <dirver.name>  # <-- driver.name in iomesh-values.yaml
deletionPolicy: Retain
```

```shell
kubectl apply -f snapshotclass.yaml
```
