---
id: version-0.11.0-cluster-operations
title: Cluster Operations
sidebar_label: Cluster Operations
original_id: cluster-operations
---

IOMesh Cluster can be scaled out and upgraded without interrupting the online services.

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

> **_NOTE_: replace `iomesh` with your release name.**

```bash
helm upgrade --namespace iomesh-system iomesh iomesh/iomesh --values iomesh-values.yaml
```

### Chunk Server

#### Scale out

Edit `chunk/replicaCount` in `iomesh-values.yaml`.

```yaml
chunk:
  replicaCount: 5 # <- increase this number to scale Chunk Server
```

Then apply the change:

> **_NOTE_: replace `iomesh` with your release name.**

```bash
helm upgrade --namespace iomesh-system iomesh iomesh/iomesh --values iomesh-values.yaml
```

## Upgrade IOMesh storage cluster

Follow the following steps to upgrade IOMesh once a new version is released.

> **_NOTE_: If you only have 1 replica of meta server or chunk server, the upgrade process will never start.**

1. Export the default config `iomesh-values.yaml` from Chart

    > **_NOTE_: If you already exported the config, you can skip this step.**

    ```bash
    helm show values iomesh/iomesh > iomesh-values.yaml
    ```

2. Edit `iomesh-values.yaml`

    ```yaml
    # The version of the IOMeshCluster. You get a new release from: http://iomesh.com/docs/release/releases
    version: v5.0.0-rc5
    ```

3. Upgrade the IOMesh Cluster

    > **_NOTE_: `iomesh` is the release name, you may modify it.**

    ```bash
    helm upgrade --namespace iomesh-system iomesh iomesh/iomesh --values iomesh-values.yaml
    ```

4. Wait untill the new chunk server pods are ready.

    ```bash
    watch kubectl get pod --namespace iomesh-system
    ```

## Uninstall IOMesh storage cluster

> **_Attention_: All data will be lost after you uninstall an IOMesh storage cluster, including PVCs created with IOMesh StorageClass.**

Run the following command to uninstall an IOMesh cluster.

> **_NOTE_: You may replace `iomesh` with your own name.**

```bash
helm uninstall --namespace iomesh-system iomesh
```

[1]: http://www.iomesh.com/docs/installation/setup-iomesh-storage#mount-device
