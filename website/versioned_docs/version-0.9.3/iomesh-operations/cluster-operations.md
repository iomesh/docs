---
id: version-0.9.3-cluster-operations
title: Cluster Operations
sidebar_label: Cluster Operations
original_id: cluster-operations
---

IOMesh Cluster can be scaled and upgraded without interrupting the online services.

## Scale IOMesh Storage Cluster

### Meta Server

#### Scale out

Edit `meta/replicaCount` in `iomesh-values.yaml`. It is recommanded to have 3~5 Meta Servers in a production environment.

Example:
```yaml
meta:
  replicaCount: 3
```

You may also want to adjust `meta/podPolicy` for higher resilience:

```yaml
meta:
  podPolicy:
    affinity:
      nodeAffinity:
        requiredDuringSchedulingIgnoredDuringExecution:
          nodeSelectorTerms:
          - matchExpressions:
            - key: kubernetes.io/e2e-az-name
              operator: In
              values:
              - az1
              - az2
```

Then apply the change:

> **_NOTE_: replace `my-iomesh` with your release name.**

```bash
helm upgrade --namespace iomesh-system my-iomesh iomesh/iomesh --values iomesh-values.yaml
```

### Chunk Server

#### Scale out

Edit `chunk/replicaCount` in `iomesh-values.yaml`.

```yaml
chunk:
  replicaCount: 5 # <- increase this number to scale Chunk Server
```

Then apply the change:

> **_NOTE_: replace `my-iomesh` with your release name.**

```bash
helm upgrade --namespace iomesh-system my-iomesh iomesh/iomesh --values iomesh-values.yaml
```

## Upgrade IOMesh storage cluster

Follow the steps below to upgrade the IOMesh once a new version is released.

> **_NOTE_: If you only have 1 replica of meta server or chunk server, the upgrade process will never start.**

1. Export default config `iomesh-values.yaml` from Chart

> **_NOTE_: If you already exported the config, you can skip this step.**

```bash
helm show values iomesh/iomesh > iomesh-values.yaml
```

2. Edit `iomesh-values.yaml`

```yaml
# The version of the IOMeshCluster. You get new release from: http://iomesh.com/docs/release/releases
version: v5.0.0-rc5
```

3. Upgrade the IOMesh Cluster

> **_NOTE_: `my-iomesh` is release name, maybe you want to modify it.**

```bash
helm upgrade --namespace iomesh-system my-iomesh iomesh/iomesh --values iomesh-values.yaml
```

4. Wait new chunk server pods are ready.

```bash
watch kubectl get pod --namespace iomesh-system
```

## Uninstallation IOMesh storage cluster

> **_/!\ Attention_: All data will be lost after you uninstall a IOMesh storage cluster, including PVCs created with IOMesh StorageClass.**

Run the below command to unistall a IOMesh cluster.

> **_NOTE_: You may replace `my-iomesh` with your own name.**

```bash
helm uninstall --namespace iomesh-system my-iomesh
```

[1]: http://www.iomesh.com/docs/installation/setup-iomesh-storage#mount-device
