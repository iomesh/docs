---
id: setupclusterstorage
title: Setup k8s Cluster Storage
sidebar_label: Setup k8s Cluster Storage
---

## Setup StorageClass

StorageClass have parameters that describe volumes belonging to the StorageClass.

| Parameters                | Values                        | Default | Description                       |
| ------------------------- | ----------------------------- | ------- | --------------------------------- |
| csi.storage.k8s.io/fstype | "xfs", "ext2", "ext3", "ext4" | "ext4"  | volume File system type           |
| replicaFactor             | "1", "2", "3"                 | "2"     | replica factor                    |
| thinProvision             | "true", "false"               | "true"  | thin provision or thick provision |

```yaml
# storageclass.yaml
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: zbs-csi-driver-default
# driver.name in values.yaml
provisioner: <driver.name>
# Delete / Retain
reclaimPolicy: Retain
allowVolumeExpansion: true
parameters:
  # "ext4" / "ext3" / "ext2" / "xfs"
  csi.storage.k8s.io/fstype: "ext4"
  # "1" / "2" / "3"
  replicaFactor: "1"
  # "true" / "false"
  thinProvision: "true"
volumeBindingMode: Immediate
```

```shell
kubectl apply -f storageclass.yaml
```

## Setup SnapshotClass

> **_Note:_ Only for `Kubernetes >= v1.13.0` or `Openshift >= v4.0`**

```yaml
# snapshotclass.yaml
apiVersion: snapshot.storage.k8s.io/v1beta1
kind: VolumeSnapshotClass
metadata:
  name: zbs-csi-driver-default
# driver.name in values.yaml
driver: <dirver.name>
# Delete / Retain
deletionPolicy: Retain
```

```shell
kubectl apply -f snapshotclass.yaml
```

